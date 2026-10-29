# Markdown Editor

[ภาษาไทย](README.th.md)

A Markdown editor that runs entirely in the browser. You edit on the left and see the rendered preview on the right as you type. It can open several files as tabs and saves your work automatically.

The whole app is one HTML file (`markdownReader.html`) plus a few libraries in `lib/`. There is no build step and no backend, and it works without an internet connection.

## Features

- **Edit + preview** side by side, with a resizable split, plus edit-only and preview-only modes
- **Tabs**: open many files at once; each tab has its own undo/redo history and cursor position
- **Autosave** to the browser on every change, and straight back to the file on disk in Chrome and Edge
- **Syntax highlighting** for fenced code blocks, in 38 languages plus a `cuda` alias
- **Toolbar and shortcuts** for bold, italic, links, code, lists, checklists and quotes
- **Drag & drop**: drop one or more files onto the page to open them
- **Light and dark themes**, and a layout that works on phone screens
- **XSS protection**: DOMPurify filters any HTML in the Markdown before it is shown

## Getting started

### Option 1: open the file directly
Open `markdownReader.html` in Chrome or Edge. The `lib/` folder must sit next to it.

### Option 2: run it with Docker (nginx)
```sh
docker compose up -d --build
```
Then open http://localhost:8080. To use a different port, run `PORT=3000 docker compose up -d`.

| Command | Purpose |
|---|---|
| `docker compose up -d --build` | Rebuild and start (run this after editing the app) |
| `docker compose logs -f` | Follow the logs |
| `docker compose down` | Stop |

### Option 3: desktop app (Electron)
Install the app from `desktop/dist/`. The other machine needs nothing else installed.

| System | File | How to install |
|---|---|---|
| macOS, Apple Silicon (M1–M4) | `Markdown Editor-<version>-mac-arm64.dmg` | Open the .dmg and drag the app to Applications |
| macOS, Intel | `Markdown Editor-<version>-mac-x64.dmg` | Same as above |
| Windows 10/11 | `Markdown Editor-<version>-win-x64.zip` | Unzip anywhere and run `Markdown Editor.exe` |
| Linux | `Markdown Editor-<version>-linux-x86_64.AppImage` | `chmod +x` the file, then run it |

The app isn't signed with a paid certificate, so the system warns the first time it opens:
- **macOS**: *"Apple could not verify…"*. Go to System Settings → Privacy & Security → **Open Anyway**, or run `xattr -cr "/Applications/Markdown Editor.app"`.
- **Windows**: *"Windows protected your PC"*. Click **More info** → **Run anyway**.

## Keyboard shortcuts

| Keys | Action |
|---|---|
| `⌘/Ctrl + S` | Save (asks where to save the first time) |
| `⌘/Ctrl + O` | Open files |
| `⌘/Ctrl + B` / `I` / `K` | Bold / italic / link |
| `Tab` / `Shift + Tab` | Indent / outdent, including across several lines |
| `Enter` in a list | Starts the next list item; on an empty item it ends the list |
| `Alt + N` | New tab |
| `Alt + W` | Close tab |
| `Alt + ←` / `→` | Previous / next tab |

The tab shortcuts use `Alt` because browsers keep `⌘/Ctrl + T` and `W` for themselves. The desktop app also has `⌘/Ctrl + T` (new tab), `⌘/Ctrl + W` (close tab) and `Ctrl + Tab` / `Ctrl + Shift + Tab` (next / previous tab).

---

## How it works

### Overview

```
active tab's <textarea>
   │
   ├── input ──► marked (MD → HTML) ──► DOMPurify (strip XSS) ──► preview
   │
   └── 0.6 s after typing stops ──┬──► localStorage        (always)
                                  └──► .md file on disk    (if the tab is linked to a file)
```

### 1. Rendering Markdown
1. Every keystroke fires an `input` event.
2. Updates are batched to at most one per screen frame with `requestAnimationFrame`, so fast typing stays smooth.
3. `marked` converts the Markdown to HTML. It supports GFM, so tables, checklists and similar work.
   - Fenced code blocks with a language (` ```js `) are colored by `highlight.js` (see below).
4. `DOMPurify` removes anything dangerous, such as `<script>` tags, `onerror=` attributes and `javascript:` links.
   - External links are set to open in a new tab (`target="_blank" rel="noopener"`).
5. The result goes into the preview pane.

**Syntax highlighting.** The app replaces marked's code-block renderer:
- The language is the first word after the backticks. If `highlight.js` knows it, the code is colored with `hljs.highlight()`.
- Blocks without a language, or with an unknown one, are shown as plain escaped text. The app doesn't guess the language.
- Supported: the 36 languages in the highlight.js common bundle (bash, c, cpp, css, diff, go, java, javascript, json, python, rust, sql, typescript, xml/html, yaml, and more), plus `dockerfile` and `nginx`. `cuda`, `cu` and `cuh` are highlighted as C++.
- Results are cached by language and code, so typing elsewhere in the document doesn't re-highlight unchanged blocks.
- Colors are CSS variables (`--sx-*`) that switch with the light and dark themes. No highlight.js theme file is loaded.

The status bar counts words with `Intl.Segmenter`, which also splits languages written without spaces (such as Thai) into real words.

### 2. Tabs
Each tab is a `doc` object:

```js
{ id, name, handle, ta, dirty, needPerm, status, previewScroll, saveTimer }
```

- **`ta`**: each tab has its own `<textarea>`, and only one is shown at a time. That keeps undo/redo, cursor position and scroll position separate per tab.
- **`handle`**: the link to the real file on disk (a `FileSystemFileHandle`), or `null` if the tab has never been saved as a file.
- **`dirty`**: the tab has changes that are not in its file yet. It shows as a dot on the tab.

How tabs behave:
- Opening a file that is already open switches to its tab instead of opening it twice (checked with `handle.isSameEntry`).
- If the only tab is empty, an opened file takes its place instead of adding a new tab.
- Closing a tab that has never been saved to a file asks for confirmation first.
- Closing a tab that is linked to a file saves it to the file first.

### 3. Saving
Saving runs 0.6 seconds after you stop typing and has two layers:

| Layer | Where | When |
|---|---|---|
| Browser | `localStorage` | **Always**. Your work survives closing the tab or the browser. |
| Real file | The .md file on disk | When the tab is linked to a file (opened from one, or saved once) |

Writing to the real file uses the [File System Access API](https://developer.mozilla.org/docs/Web/API/File_System_API) in Chrome and Edge:
1. `showOpenFilePicker()` / `showSaveFilePicker()` return a `handle` to the file.
2. `handle.requestPermission({ mode: 'readwrite' })` asks for permission to write.
3. Every autosave writes through `handle.createWritable()`.

Handles can't be stored in localStorage, so they are kept in IndexedDB. That way the app still knows which tab belongs to which file after a reload.
- The browser asks for write permission again each time the page loads.
- Until you allow it, an **"allow saving to file"** button appears.
- Your work keeps saving to the browser in the meantime, so nothing is lost.

**What is stored in the browser**

| Key | Contents |
|---|---|
| `mdr.tabs` | The list of tabs, `[{ id, name }]` |
| `mdr.active` | The id of the open tab |
| `mdr.doc.<id>` | The text of each tab |
| `mdr.view`, `mdr.split`, `mdr.theme` | View mode, split width and theme |
| IndexedDB `mdr` → `handle:<id>` | File handles for linked tabs |

This data belongs to the page's origin. Work done while the app was opened through `file://` does not show up at `http://localhost:8080`, and the other way around.

### 4. Browsers without the File System Access API
Safari and Firefox don't have this API. The app detects that when the page loads (`canFS`) and switches to:
- **Open** through a regular `<input type="file">`
- **Save** by downloading a .md file instead of writing over the original
- **Autosave** to the browser, which works as usual

### 5. Why saving to files doesn't work from another machine over plain HTTP
Chrome only provides the File System Access API on pages that are a **secure context**: `https://`, `http://localhost` and `file://`.
- At `http://192.168.x.x:8080` the API does not exist at all, so the app falls back to downloading files.
- The reason is that plain HTTP is not encrypted, so anyone between the browser and the server can change the JavaScript in transit. If such a page could write files, an attacker could use it to read or overwrite the user's files.

For full functionality on other machines, put HTTPS in front of nginx (for example Caddy with Let's Encrypt, mkcert, or `tailscale serve`), or use an SSH tunnel so the other machine opens the app through `localhost`.

### 6. nginx (Docker)
`nginx.conf` sets up the following:
- The app is served at `/`, and `/markdownReader.html` redirects there.
- `index.html` is never cached, so browsers always get the latest version. Files in `lib/` are cached for 30 days.
- A Content-Security-Policy only allows scripts and styles from this server, as a second layer of protection on top of DOMPurify.
  - Images may come from anywhere, so images linked from the web inside Markdown still show.
- `.dockerignore` only sends the files the app needs into the image, so `tests/` is left out.

### 7. Desktop app (Electron)
The desktop app loads the same `markdownReader.html`. The only part that changes is how files are reached.

```
main.js (Node.js)                    preload.js                 markdownReader.html
──────────────────                   ──────────                 ───────────────────
native open/save dialogs   ◄─IPC─►   window.desktop    ◄─────►   bridge + desktopHandle(path)
fs.readFile / fs.writeFile           (only these               (looks like a browser file handle,
Finder/Explorer "Open with"           functions)                so tabs, autosave and Save As
menu, quit handling                                             work unchanged)
```

- **`desktopHandle(path)`** in the page acts like a `FileSystemFileHandle` but reads and writes through the main process. Permission is always granted, so there are no "allow saving" prompts. Linked tabs are remembered by their path.
- **Security**
  - The page runs with `contextIsolation` and `sandbox` and has no Node.js access. It can only call the functions in `preload.js`.
  - The main process only reads or writes `.md`, `.markdown` and `.txt` files, by absolute path.
  - The page is served from an `app://` scheme with the same Content-Security-Policy as nginx.
  - Links open in the system browser.
- **Opening files from the OS**: double-clicking a `.md` file, "Open with", dropping on the Dock icon, or starting a second copy of the app all open the file as a tab in the running app.
- **Quitting** (closing the window, `⌘Q`, logging out) first writes any autosave that is still waiting, then quits.
- **Data** (tabs, settings) is stored per machine in the app's own profile, separate from any browser.

**Developing and building** (in `desktop/`, requires Node.js):

```sh
cd desktop
npm install
npm start                 # run the app from source
npm run smoke             # end-to-end check of the real app (exit code 0 = passed)
npm run build:mac         # .dmg for Apple Silicon and Intel
npm run build:docker      # Windows .zip + Linux .AppImage, built inside Docker
```

- **Windows and Linux**: their packaging tools are x86-64 only, so on an Apple Silicon Mac without Rosetta they are built in Docker (`build-in-docker.sh`, image `electronuserland/builder:wine`). On an Intel machine, or with Rosetta, `npm run build:win` / `build:linux` also work.
- **Windows installer**: the `.exe` installer (NSIS) needs wine, which crashes under emulation on Apple Silicon. Build it on a Windows machine with `npm run build:win-installer`. The installer also registers the `.md` file association, which the .zip can't do.
- **Code signing**: macOS builds are ad-hoc signed (`build/adhoc-sign.js`), because Apple Silicon won't run unsigned code at all. Removing the first-launch warnings needs an Apple Developer ID ($99/year, plus notarization) and a Windows code-signing certificate.
- **If the app starts as plain Node.js** (`app` is undefined): the terminal has `ELECTRON_RUN_AS_NODE=1` set (VS Code can do this). Run `unset ELECTRON_RUN_AS_NODE` first.

---

## Project layout

```
.
├── markdownReader.html   # The whole app (HTML + CSS + JS)
├── lib/
│   ├── marked.min.js     # marked v15.0.12: Markdown to HTML
│   ├── purify.min.js     # DOMPurify v3.2.6: HTML sanitizer
│   ├── highlight.min.js  # highlight.js v11.11.1 (common languages): syntax highlighting
│   ├── hljs-dockerfile.min.js  # extra highlight.js grammar
│   └── hljs-nginx.min.js       # extra highlight.js grammar
├── tests/
│   ├── index.html        # Test suite (runs in the browser)
│   ├── run.sh            # Runs the suite in headless Chrome
│   └── server.py         # Serves the files and prints the test report
├── desktop/              # Electron desktop app
│   ├── main.js           # Main process: window, menu, dialogs, file access
│   ├── preload.js        # The only API the page gets (window.desktop)
│   ├── smoke.js          # End-to-end check run by `npm run smoke`
│   ├── build/            # App icon and ad-hoc signing hook
│   ├── build-in-docker.sh  # Windows + Linux builds in Docker
│   └── package.json      # Electron 45.1.0, electron-builder 26.18.0, build settings
├── Dockerfile            # nginx:1.27-alpine + app files
├── docker-compose.yml
├── nginx.conf
└── .dockerignore
```

## Tests

```sh
./tests/run.sh          # Run in the terminal (exit code 0 = all passed)
./tests/run.sh --open   # Open the test page in your browser
```
Requires Google Chrome and python3.

The suite has 57 tests. They cover offline loading, rendering, syntax highlighting, XSS filtering, the toolbar, shortcuts, autosave, tabs, opening and saving files, browsers without the File System Access API, the desktop app's file bridge (with a stand-in `window.desktop`), drag & drop, and the layout on both desktop and phone widths.

The desktop app has its own check against the real Electron app: `cd desktop && npm run smoke`.

How a test run works:
1. `run.sh` starts `server.py` and headless Chrome.
2. The test page loads the app in an iframe and types, clicks and presses shortcuts the way a user would.
3. When it finishes, the page sends the results to `server.py`, which prints them to the terminal and exits.

Opening and saving real files needs a person to pick a file and grant permission, so the tests use stand-in file handles instead.

## Updating the libraries

The libraries are pinned to exact versions. To update one, download the new version over the old file and run the tests:

```sh
curl -fL -o lib/marked.min.js https://cdn.jsdelivr.net/npm/marked@<version>/marked.min.js
curl -fL -o lib/purify.min.js https://cdn.jsdelivr.net/npm/dompurify@<version>/dist/purify.min.js
curl -fL -o lib/highlight.min.js https://cdnjs.cloudflare.com/ajax/libs/highlight.js/<version>/highlight.min.js
./tests/run.sh
```

To highlight another language that isn't in the common bundle, download its grammar into `lib/` and add a `<script>` tag for it after `highlight.min.js` in `markdownReader.html`:

```sh
curl -fL -o lib/hljs-<language>.min.js https://cdnjs.cloudflare.com/ajax/libs/highlight.js/<version>/languages/<language>.min.js
```

Grammars must be the same version as `highlight.min.js`.

The desktop app copies `markdownReader.html` and `lib/` when it is built, so rebuild it after changing either.

## Limitations

- **Syntax highlighting needs a language tag.** Code blocks without one (` ``` ` alone) stay plain, and languages outside the bundle need their grammar added (see above).
- **Changes made by other programs are not detected.** If another program edits the same file while it is open here, the next save overwrites those changes.
- **Browser storage stays in that browser.** Work kept in the browser does not sync across machines or browsers. Save it as a file to continue elsewhere.
