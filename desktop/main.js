// Electron main process: one window that hosts markdownReader.html, plus native file access for it.
const { app, BrowserWindow, Menu, dialog, ipcMain, nativeTheme, net, protocol, shell } = require('electron');
const fs = require('node:fs/promises');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const SMOKE = process.argv.includes('--smoke');
// Smoke runs get a throwaway profile so they never touch the user's tabs
if (SMOKE) app.setPath('userData', require('node:fs').mkdtempSync(path.join(require('node:os').tmpdir(), 'mdr-profile-')));
// Packaged: files are copied into app/ (see "build.files" in package.json). Development: the repo root.
const APP_DIR = app.isPackaged ? path.join(__dirname, 'app') : path.resolve(__dirname, '..');
const APP_URL = 'app://bundle/markdownReader.html';
const MD_FILE = /\.(md|markdown|txt)$/i;
const FILTERS = [{ name: 'Markdown', extensions: ['md', 'markdown', 'txt'] }];
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  'img-src * data: blob:',
  "object-src 'none'",
  "base-uri 'self'",
].join('; ');

let win = null;
let rendererReady = false;
let pendingPaths = [];
let quitting = false;

// A standard, secure scheme gives the page a stable origin (so localStorage persists) and lets us attach a CSP
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } },
]);

/* ---------- Single instance: a second launch hands its files to the running app ---------- */
if (!SMOKE && !app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', (_e, argv, cwd) => openPaths(pathsFromArgv(argv.slice(1), cwd)));
}

// macOS delivers "Open with" / double-click / drop-on-Dock as events, possibly before the app is ready
app.on('open-file', (e, file) => {
  e.preventDefault();
  openPaths([file]);
});

function pathsFromArgv(args, cwd = process.cwd()) {
  return args.filter(a => !a.startsWith('-') && MD_FILE.test(a)).map(a => path.resolve(cwd, a));
}

function openPaths(paths) {
  paths = paths.filter(p => MD_FILE.test(p));
  if (!paths.length) return;
  paths.forEach(p => app.addRecentDocument(p));
  if (win && rendererReady) {
    win.webContents.send('open-paths', paths);
    if (win.isMinimized()) win.restore();
    win.focus();
  } else {
    pendingPaths.push(...paths);
    if (app.isReady() && !win) createWindow();
  }
}

/* ---------- File access for the renderer ---------- */
// The renderer only ever gets to read or write Markdown/text files, by absolute path
function checkedPath(p) {
  if (typeof p !== 'string' || !path.isAbsolute(p) || !MD_FILE.test(p)) {
    throw new Error('File not allowed: ' + p);
  }
  return p;
}

ipcMain.handle('open-dialog', async () => {
  const res = await dialog.showOpenDialog(win, { properties: ['openFile', 'multiSelections'], filters: FILTERS });
  if (res.canceled) return [];
  res.filePaths.forEach(p => app.addRecentDocument(p));
  return res.filePaths;
});

ipcMain.handle('save-dialog', async (_e, suggestedName) => {
  const name = path.basename(String(suggestedName || 'untitled.md'));
  const res = await dialog.showSaveDialog(win, {
    defaultPath: path.join(app.getPath('documents'), name),
    filters: FILTERS,
  });
  if (res.canceled || !res.filePath) return null;
  const file = MD_FILE.test(res.filePath) ? res.filePath : res.filePath + '.md';
  app.addRecentDocument(file);
  return file;
});

ipcMain.handle('read-file', (_e, p) => fs.readFile(checkedPath(p), 'utf8'));
ipcMain.handle('write-file', (_e, p, text) => fs.writeFile(checkedPath(p), String(text), 'utf8'));

ipcMain.on('renderer-ready', e => {
  if (e.sender !== win?.webContents) return;
  rendererReady = true;
  if (pendingPaths.length) {
    win.webContents.send('open-paths', pendingPaths);
    pendingPaths = [];
  }
});

/* ---------- Window ---------- */
function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 640,
    minHeight: 420,
    show: false,
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#0d1117' : '#f6f7f9',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      spellcheck: false,
    },
  });

  win.once('ready-to-show', () => { if (!SMOKE) win.show(); });
  win.webContents.on('did-start-loading', () => { rendererReady = false; });

  // Links in the preview open in the system browser; the window itself never navigates away
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^(https?|mailto):/i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => {
    e.preventDefault();
    if (/^(https?|mailto):/i.test(url)) shell.openExternal(url);
  });

  // Let the page write pending autosaves before the window goes away
  let flushed = false;
  win.on('close', e => {
    if (flushed || !rendererReady) return;
    e.preventDefault();
    const finish = () => {
      if (flushed) return;
      flushed = true;
      // Preventing the close above cancelled any quit in progress (⌘Q, logout), so resume it
      if (quitting) app.quit();
      else win?.close();
    };
    ipcMain.once('flushed', finish);
    setTimeout(finish, 2000);
    win.webContents.send('flush');
  });
  win.on('closed', () => {
    win = null;
    rendererReady = false;
  });

  win.loadURL(APP_URL);
  return win;
}

/* ---------- Menu ---------- */
function buildMenu() {
  const isMac = process.platform === 'darwin';
  const send = cmd => () => win?.webContents.send('menu', cmd);
  const template = [
    ...(isMac ? [{ role: 'appMenu' }] : []),
    {
      label: 'File',
      submenu: [
        { label: 'New Tab', accelerator: 'CmdOrCtrl+T', click: send('new') },
        { label: 'Open…', accelerator: 'CmdOrCtrl+O', click: send('open') },
        ...(isMac ? [{ label: 'Open Recent', role: 'recentDocuments', submenu: [{ label: 'Clear Menu', role: 'clearRecentDocuments' }] }] : []),
        { type: 'separator' },
        { label: 'Save', accelerator: 'CmdOrCtrl+S', click: send('save') },
        { type: 'separator' },
        { label: 'Close Tab', accelerator: 'CmdOrCtrl+W', click: send('close') },
        ...(isMac ? [] : [{ type: 'separator' }, { role: 'quit' }]),
      ],
    },
    { role: 'editMenu' },
    {
      label: 'View',
      submenu: [
        { label: 'Next Tab', accelerator: 'Ctrl+Tab', click: send('next') },
        { label: 'Previous Tab', accelerator: 'Ctrl+Shift+Tab', click: send('prev') },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        ...(app.isPackaged ? [] : [{ type: 'separator' }, { role: 'reload' }, { role: 'toggleDevTools' }]),
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { type: 'separator' },
        { label: 'Close Window', accelerator: 'CmdOrCtrl+Shift+W', role: 'close' },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

/* ---------- Startup ---------- */
app.whenReady().then(() => {
  // Serve only files inside APP_DIR, with a Content-Security-Policy on every response
  protocol.handle('app', async req => {
    const file = path.join(APP_DIR, decodeURIComponent(new URL(req.url).pathname));
    if (!file.startsWith(APP_DIR + path.sep)) return new Response('Not found', { status: 404 });
    const res = await net.fetch(pathToFileURL(file).toString());
    const headers = new Headers(res.headers);
    headers.set('Content-Security-Policy', CSP);
    return new Response(res.body, { status: res.status, headers });
  });

  buildMenu();
  // Windows / Linux pass files as command-line arguments
  if (process.platform !== 'darwin') pendingPaths.push(...pathsFromArgv(process.argv.slice(1)));
  createWindow();
  if (SMOKE) require('./smoke')(win, { openPaths });

  app.on('activate', () => { if (!win) createWindow(); });
});

app.on('before-quit', () => { quitting = true; });

app.on('window-all-closed', () => {
  // smoke.js exits by itself once its checks are done
  if (process.platform !== 'darwin' && !SMOKE) app.quit();
});
