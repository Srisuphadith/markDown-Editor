// End-to-end check of the real Electron app: `npm run smoke` (exit code 0 = passed).
// Opens a temp .md file the way Finder would, edits it, and checks the change reaches the disk.
const { app } = require('electron');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

module.exports = function smoke(win, { openPaths }) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mdr-smoke-'));
  const file = path.join(dir, 'smoke.md');
  fs.writeFileSync(file, '# Smoke\n\n```js\nconst x = 1;\n```\n');

  const js = code => win.webContents.executeJavaScript(code);
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  async function waitFor(check, what, ms = 5000) {
    const start = Date.now();
    while (Date.now() - start < ms) {
      if (await check().catch(() => false)) return;
      await sleep(50);
    }
    throw new Error('timed out waiting for: ' + what);
  }

  const results = [];
  async function step(name, fn) {
    try { await fn(); results.push(`PASS  ${name}`); }
    catch (err) { results.push(`FAIL  ${name}\n        ${err.message}`); }
  }

  win.webContents.on('console-message', e => { if (e.level !== 'info') console.log('[renderer]', e.level, e.message, e.sourceId + ':' + e.lineNumber); });
  win.webContents.once('did-finish-load', async () => {
    await step('page loads with the desktop bridge and no Node.js access', async () => {
      await waitFor(() => js('typeof active !== "undefined" && !!active'), 'app init');
      const env = await js('({ desktop: typeof window.desktop, require: typeof require, process: typeof process, hljs: typeof hljs })');
      if (env.desktop !== 'object') throw new Error('window.desktop missing');
      if (env.require !== 'undefined' || env.process !== 'undefined') throw new Error('Node.js leaked into the page');
      if (env.hljs !== 'object') throw new Error('lib/ scripts not loaded');
    });

    await step('Content-Security-Policy blocks remote scripts', async () => {
      const blocked = await js(`new Promise(res => {
        document.addEventListener('securitypolicyviolation', () => res(true), { once: true });
        const s = document.createElement('script'); s.src = 'https://example.com/x.js'; document.head.append(s);
        setTimeout(() => res(false), 2000);
      })`);
      if (!blocked) throw new Error('remote script was not blocked');
    });

    await step('file opened from the OS appears as a tab with highlighted code', async () => {
      openPaths([file]);
      await waitFor(() => js('active.name === "smoke.md"'), 'smoke.md tab');
      const h1 = await js('document.querySelector("#out h1")?.textContent');
      if (h1 !== 'Smoke') throw new Error('preview h1 = ' + h1);
      if (!(await js('!!document.querySelector("#out .hljs-keyword")'))) throw new Error('code not highlighted');
      if (!(await js('active.status.msg.includes("เชื่อมกับไฟล์")'))) throw new Error('tab not linked to the file');
    });

    await step('typing autosaves to the file on disk', async () => {
      await js(`editor.value = '# Changed by smoke test'; editor.dispatchEvent(new Event('input', { bubbles: true })); true`);
      await waitFor(async () => fs.readFileSync(file, 'utf8') === '# Changed by smoke test', 'file written');
    });

    await step('writing a non-Markdown path is refused', async () => {
      const target = path.join(dir, 'evil.sh');
      const outcome = await js(`desktop.writeFile(${JSON.stringify(target)}, 'x').then(() => 'written', () => 'refused')`);
      if (outcome !== 'refused' || fs.existsSync(target)) throw new Error('write was allowed');
    });

    // Last step: quitting (⌘Q) must write the pending autosave and then really quit
    await js(`editor.value = '# Saved on quit'; editor.dispatchEvent(new Event('input', { bubbles: true })); true`);
    const guard = setTimeout(() => finish('FAIL  quitting flushes a pending autosave and exits\n        app did not quit'), 4000);
    app.once('will-quit', e => {
      e.preventDefault();
      clearTimeout(guard);
      const saved = fs.readFileSync(file, 'utf8') === '# Saved on quit';
      finish(saved
        ? 'PASS  quitting flushes a pending autosave and exits'
        : 'FAIL  quitting flushes a pending autosave and exits\n        file was not written before quit');
    });
    app.quit();   // well inside the 0.6 s autosave delay
  });

  function finish(lastResult) {
    results.push(lastResult);
    const failed = results.filter(r => r.startsWith('FAIL')).length;
    console.log('\n' + results.join('\n') + `\n\nSMOKE ${results.length - failed}/${results.length} passed`);
    fs.rmSync(dir, { recursive: true, force: true });
    app.exit(failed ? 1 : 0);
  }
};
