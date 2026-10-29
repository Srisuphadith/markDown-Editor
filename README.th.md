# Markdown Editor

[English](README.md)

โปรแกรมแก้ไข Markdown ที่ทำงานบนเบราว์เซอร์ทั้งหมด แก้ทางซ้าย ดูผลทางขวาแบบเรียลไทม์ เปิดได้หลายไฟล์เป็นแท็บ และบันทึกอัตโนมัติ

ทั้งโปรแกรมคือไฟล์ HTML ไฟล์เดียว (`markdownReader.html`) กับไลบรารีไม่กี่ตัวในโฟลเดอร์ `lib/` ไม่มี build step ไม่มี backend และใช้งานได้โดยไม่ต้องต่ออินเทอร์เน็ต

## ความสามารถ

- **แก้ไข + พรีวิว** แบบแบ่งจอ ปรับขนาดได้ และสลับเป็นโหมดแก้ไขอย่างเดียวหรือพรีวิวอย่างเดียวได้
- **หลายแท็บ** เปิดหลายไฟล์พร้อมกัน แต่ละแท็บมี Undo/Redo และตำแหน่ง cursor ของตัวเอง
- **บันทึกอัตโนมัติ** เก็บในเบราว์เซอร์เสมอ และเขียนลงไฟล์จริงบนดิสก์ได้ (Chrome / Edge)
- **ระบายสีโค้ด (syntax highlight)** ในบล็อกโค้ด รองรับ 38 ภาษา และเขียน `cuda` ได้ด้วย
- **แถบเครื่องมือและคีย์ลัด** สำหรับตัวหนา ตัวเอียง ลิงก์ โค้ด รายการ เช็กลิสต์ และอ้างอิง
- **ลากไฟล์มาวาง** ได้ทีละหลายไฟล์
- **ธีมสว่าง/มืด** และใช้บนจอมือถือได้
- **ปลอดภัยจาก XSS** HTML ที่อยู่ใน Markdown ถูกกรองด้วย DOMPurify ก่อนแสดงผล

## เริ่มใช้งาน

### วิธีที่ 1: เปิดไฟล์ตรงๆ
ดับเบิลคลิก `markdownReader.html` ให้เปิดใน Chrome หรือ Edge ได้เลย โดยต้องมีโฟลเดอร์ `lib/` อยู่ข้างกัน

### วิธีที่ 2: รันผ่าน Docker (nginx)
```sh
docker compose up -d --build
```
แล้วเปิด http://localhost:8080 ถ้าต้องการเปลี่ยนพอร์ตใช้ `PORT=3000 docker compose up -d`

| คำสั่ง | ใช้ทำอะไร |
|---|---|
| `docker compose up -d --build` | build ใหม่และรัน (ใช้หลังแก้ไฟล์) |
| `docker compose logs -f` | ดู log |
| `docker compose down` | หยุด |

### วิธีที่ 3: แอปเดสก์ท็อป (Electron)
ติดตั้งจากไฟล์ในโฟลเดอร์ `desktop/dist/` เครื่องที่นำไปใช้ไม่ต้องติดตั้งอะไรเพิ่ม

| ระบบ | ไฟล์ | วิธีติดตั้ง |
|---|---|---|
| macOS ชิป Apple (M1–M4) | `Markdown Editor-<เวอร์ชัน>-mac-arm64.dmg` | เปิด .dmg แล้วลากแอปไปไว้ใน Applications |
| macOS ชิป Intel | `Markdown Editor-<เวอร์ชัน>-mac-x64.dmg` | เหมือนด้านบน |
| Windows 10/11 | `Markdown Editor-<เวอร์ชัน>-win-x64.zip` | แตกไฟล์ไว้ที่ไหนก็ได้ แล้วเปิด `Markdown Editor.exe` |
| Linux | `Markdown Editor-<เวอร์ชัน>-linux-x86_64.AppImage` | `chmod +x` แล้วเปิดไฟล์ |

แอปไม่ได้เซ็นด้วย certificate แบบเสียเงิน ระบบจึงเตือนตอนเปิดครั้งแรก:
- **macOS**: *"Apple ตรวจสอบไม่ได้…"* ไปที่ System Settings → Privacy & Security → **Open Anyway** หรือรัน `xattr -cr "/Applications/Markdown Editor.app"`
- **Windows**: *"Windows protected your PC"* กด **More info** → **Run anyway**

## คีย์ลัด

| คีย์ | การทำงาน |
|---|---|
| `⌘/Ctrl + S` | บันทึก (ครั้งแรกจะให้เลือกที่เก็บไฟล์) |
| `⌘/Ctrl + O` | เปิดไฟล์ |
| `⌘/Ctrl + B` / `I` / `K` | ตัวหนา / ตัวเอียง / ลิงก์ |
| `Tab` / `Shift + Tab` | ย่อหน้า / ถอยย่อหน้า (ใช้กับหลายบรรทัดได้) |
| `Enter` ในรายการ | ขึ้นข้อใหม่ให้อัตโนมัติ กดบนข้อว่างเพื่อจบรายการ |
| `Alt + N` | แท็บใหม่ |
| `Alt + W` | ปิดแท็บ |
| `Alt + ←` / `→` | สลับแท็บ |

คีย์ลัดของแท็บใช้ `Alt` เพราะเบราว์เซอร์จอง `⌘/Ctrl + T` และ `W` ไว้ใช้เอง ส่วนแอปเดสก์ท็อปใช้ `⌘/Ctrl + T` (แท็บใหม่), `⌘/Ctrl + W` (ปิดแท็บ) และ `Ctrl + Tab` / `Ctrl + Shift + Tab` (แท็บถัดไป/ก่อนหน้า) ได้ด้วย

---

## ทำงานอย่างไร

### ภาพรวม

```
textarea ของแท็บที่เปิดอยู่
   │
   ├── input ──► marked (MD → HTML) ──► DOMPurify (กรอง XSS) ──► พรีวิว
   │
   └── หยุดพิมพ์ 0.6 วิ ──┬──► localStorage           (ทุกครั้ง)
                         └──► ไฟล์ .md บนดิสก์       (ถ้าแท็บเชื่อมกับไฟล์)
```

### 1. การแสดงผล Markdown
1. ทุกครั้งที่พิมพ์ จะเกิด event `input` ขึ้น
2. แอปรวบการอัปเดตไว้ทำครั้งเดียวต่อเฟรมหน้าจอด้วย `requestAnimationFrame` เพื่อไม่ให้ช้าตอนพิมพ์เร็ว
3. `marked` แปลง Markdown เป็น HTML (รองรับ GFM: ตาราง เช็กลิสต์ และอื่นๆ)
   - บล็อกโค้ดที่ระบุภาษา (` ```js `) จะถูกระบายสีด้วย `highlight.js` (ดูด้านล่าง)
4. `DOMPurify` ตัดสิ่งอันตรายออก เช่น `<script>`, `onerror=` และลิงก์ `javascript:`
   - ลิงก์ภายนอกจะถูกตั้งให้เปิดในแท็บใหม่ (`target="_blank" rel="noopener"`)
5. ผลลัพธ์ถูกใส่ลงในพื้นที่พรีวิว

**การระบายสีโค้ด** แอปใช้ฟังก์ชันของตัวเองแทนตัวแสดงบล็อกโค้ดเดิมของ marked:
- ภาษาคือคำแรกหลังเครื่องหมาย ``` ถ้า `highlight.js` รู้จักภาษานั้น จะระบายสีด้วย `hljs.highlight()`
- บล็อกที่ไม่ระบุภาษา หรือระบุภาษาที่ไม่รู้จัก จะแสดงเป็นข้อความธรรมดา แอปไม่เดาภาษาให้
- รองรับ 36 ภาษาใน common bundle ของ highlight.js (bash, c, cpp, css, diff, go, java, javascript, json, python, rust, sql, typescript, xml/html, yaml และอื่นๆ) และเพิ่ม `dockerfile` กับ `nginx` ส่วน `cuda`, `cu`, `cuh` ระบายสีแบบ C++
- ผลลัพธ์ถูก cache ตามภาษาและโค้ด พิมพ์ส่วนอื่นของเอกสารแล้วบล็อกที่ไม่ได้แก้จะไม่ถูกระบายสีใหม่
- สีกำหนดเป็นตัวแปร CSS (`--sx-*`) ที่เปลี่ยนตามธีมสว่าง/มืด ไม่ได้ใช้ไฟล์ธีมของ highlight.js

แถบด้านล่างนับคำด้วย `Intl.Segmenter` ซึ่งตัดคำภาษาไทยที่ไม่มีการเว้นวรรคได้ถูกต้อง

### 2. แท็บ
แต่ละแท็บคือ object `doc` หนึ่งตัว:

```js
{ id, name, handle, ta, dirty, needPerm, status, previewScroll, saveTimer }
```

- **`ta`** — แต่ละแท็บมี `<textarea>` ของตัวเอง แต่แสดงทีละตัว ทำให้ Undo/Redo, ตำแหน่ง cursor และตำแหน่งที่เลื่อนไว้ไม่ปนกันระหว่างแท็บ
- **`handle`** — ตัวอ้างอิงไฟล์จริงบนดิสก์ (`FileSystemFileHandle`) เป็น `null` ถ้ายังไม่เคยบันทึกเป็นไฟล์
- **`dirty`** — มีการแก้ไขที่ยังไม่ได้ลงไฟล์ แสดงเป็นจุดบนแท็บ

พฤติกรรมของแท็บ:
- เปิดไฟล์ที่เปิดอยู่แล้ว จะสลับไปแท็บเดิมแทนการเปิดซ้ำ (ตรวจด้วย `handle.isSameEntry`)
- ถ้ามีแท็บว่างอยู่แท็บเดียว ไฟล์ที่เปิดจะมาแทนที่แท็บนั้น
- ปิดแท็บที่ยังไม่ได้บันทึกเป็นไฟล์ จะถามยืนยันก่อน
- ปิดแท็บที่เชื่อมกับไฟล์ จะบันทึกลงไฟล์ให้ก่อนปิด

### 3. การบันทึก
หลังหยุดพิมพ์ 0.6 วินาที การบันทึกมี 2 ชั้น:

| ชั้น | เก็บที่ไหน | ทำเมื่อไร |
|---|---|---|
| เบราว์เซอร์ | `localStorage` | **ทุกครั้ง** ปิดแท็บหรือปิดเบราว์เซอร์แล้วเปิดใหม่ งานยังอยู่ |
| ไฟล์จริง | ไฟล์ .md บนดิสก์ | เมื่อแท็บเชื่อมกับไฟล์ (เปิดจากไฟล์ หรือเคยกดบันทึก) |

การเขียนลงไฟล์จริงใช้ [File System Access API](https://developer.mozilla.org/docs/Web/API/File_System_API) ของ Chrome / Edge:
1. `showOpenFilePicker()` / `showSaveFilePicker()` ได้ `handle` ของไฟล์มา
2. ขอสิทธิ์เขียนด้วย `handle.requestPermission({ mode: 'readwrite' })`
3. ทุกครั้งที่บันทึกอัตโนมัติ จะเขียนไฟล์ผ่าน `handle.createWritable()`

`handle` ถูกเก็บไว้ใน IndexedDB ด้วย เพราะเก็บใน localStorage ไม่ได้ เปิดหน้าใหม่แล้วแอปจึงยังรู้ว่าแท็บไหนเชื่อมกับไฟล์ไหน
- เบราว์เซอร์จะขอสิทธิ์เขียนไฟล์ใหม่ทุกครั้งที่โหลดหน้า
- ระหว่างนั้นจะมีปุ่ม **"อนุญาตให้บันทึกลงไฟล์"** ขึ้นมาให้กด
- งานยังบันทึกลงเบราว์เซอร์ตามปกติ จึงไม่มีอะไรหาย

**ข้อมูลที่เก็บในเบราว์เซอร์**

| Key | เนื้อหา |
|---|---|
| `mdr.tabs` | รายการแท็บ `[{ id, name }]` |
| `mdr.active` | id ของแท็บที่เปิดอยู่ |
| `mdr.doc.<id>` | เนื้อหาของแต่ละแท็บ |
| `mdr.view`, `mdr.split`, `mdr.theme` | โหมดการแสดงผล ขนาดแบ่งจอ และธีม |
| IndexedDB `mdr` → `handle:<id>` | handle ของไฟล์ที่เชื่อมไว้ |

ข้อมูลเหล่านี้แยกตาม origin ของหน้า งานที่ทำตอนเปิดผ่าน `file://` จะไม่ปรากฏเมื่อเปิดผ่าน `http://localhost:8080` และกลับกัน

### 4. เบราว์เซอร์ที่ไม่มี File System Access API
Safari และ Firefox ไม่มี API นี้ แอปตรวจได้ตอนโหลดหน้า (`canFS`) แล้วเปลี่ยนวิธีทำงาน:
- **เปิดไฟล์** ใช้ `<input type="file">` แทน
- **บันทึก** ดาวน์โหลดไฟล์ .md ออกมาแทนการเขียนทับไฟล์เดิม
- **บันทึกอัตโนมัติ** ยังเก็บลงเบราว์เซอร์ตามปกติ

### 5. ทำไมเปิดจากเครื่องอื่นผ่าน IP แล้วบันทึกลงไฟล์ไม่ได้
Chrome เปิดให้ใช้ File System Access API เฉพาะหน้าที่เป็น **Secure Context** คือ `https://`, `http://localhost` และ `file://` เท่านั้น
- ถ้าเปิดผ่าน `http://192.168.x.x:8080` API นี้จะไม่มีให้เรียกเลย แอปจึงใช้วิธีดาวน์โหลดไฟล์แทน
- เหตุผลคือ HTTP ไม่เข้ารหัส คนกลางทางจึงแก้โค้ด JavaScript ก่อนถึงเบราว์เซอร์ได้ ถ้าหน้าแบบนั้นเขียนไฟล์ได้ ผู้โจมตีจะใช้ช่องนี้อ่านหรือเขียนทับไฟล์ของผู้ใช้ได้

ถ้าต้องการให้เครื่องอื่นใช้ได้ครบ ต้องวาง HTTPS ไว้หน้า nginx เช่น Caddy + Let's Encrypt, mkcert หรือ `tailscale serve` หรือใช้ SSH tunnel ให้เครื่องนั้นเปิดผ่าน `localhost`

### 6. nginx (Docker)
`nginx.conf` ตั้งค่าไว้ดังนี้:
- เปิดที่ `/` ได้เลย ส่วน `/markdownReader.html` จะพาไปที่ `/` ให้
- `index.html` ไม่ถูก cache เพื่อให้ได้เวอร์ชันล่าสุดเสมอ ส่วนไฟล์ใน `lib/` cache ได้ 30 วัน
- มี Content-Security-Policy ที่อนุญาตให้โหลด script และ style จาก server นี้เท่านั้น เป็นการกันซ้อนอีกชั้นนอกจาก DOMPurify
  - รูปภาพยังโหลดจากที่ใดก็ได้ เพื่อให้รูปจากเว็บที่อ้างอิงใน Markdown แสดงได้
- `.dockerignore` ส่งเข้า image เฉพาะไฟล์ที่แอปใช้ ไม่มีโฟลเดอร์ `tests/`

### 7. แอปเดสก์ท็อป (Electron)
แอปเดสก์ท็อปโหลด `markdownReader.html` ไฟล์เดียวกับเว็บ ส่วนที่ต่างกันมีแค่วิธีเข้าถึงไฟล์

```
main.js (Node.js)                    preload.js                 markdownReader.html
──────────────────                   ──────────                 ───────────────────
หน้าต่างเปิด/บันทึกของระบบ   ◄─IPC─►   window.desktop    ◄─────►   bridge + desktopHandle(path)
fs.readFile / fs.writeFile           (มีแค่ฟังก์ชัน              (ทำตัวเหมือน file handle ของเบราว์เซอร์
"Open with" จาก Finder/Explorer       ที่กำหนด)                  แท็บ autosave และ Save As จึงใช้ได้เลย)
เมนู และการปิดแอป
```

- **`desktopHandle(path)`** ในหน้าเว็บทำตัวเหมือน `FileSystemFileHandle` แต่อ่าน/เขียนไฟล์ผ่าน main process ได้รับสิทธิ์เสมอ จึงไม่มีปุ่มขออนุญาตบันทึก และจำแท็บที่เชื่อมกับไฟล์ไว้ด้วย path
- **ความปลอดภัย**
  - หน้าเว็บรันแบบ `contextIsolation` และ `sandbox` และเข้าถึง Node.js ไม่ได้ เรียกได้แค่ฟังก์ชันใน `preload.js`
  - main process อ่าน/เขียนได้เฉพาะไฟล์ `.md`, `.markdown`, `.txt` ด้วย path แบบเต็มเท่านั้น
  - หน้าเว็บโหลดผ่าน scheme `app://` ที่มี Content-Security-Policy เดียวกับ nginx
  - ลิงก์เปิดในเบราว์เซอร์ของระบบ
- **เปิดไฟล์จากระบบ:** ดับเบิลคลิกไฟล์ .md, "Open with", ลากไฟล์ไปวางบนไอคอนใน Dock หรือเปิดแอปซ้ำ ไฟล์จะเปิดเป็นแท็บในแอปที่เปิดอยู่
- **ปิดแอป** (ปิดหน้าต่าง, `⌘Q`, ออกจากระบบ) จะบันทึกงานที่รอ autosave ลงไฟล์ก่อน แล้วจึงปิด
- **ข้อมูล** (แท็บและการตั้งค่า) เก็บแยกในแต่ละเครื่องตามโปรไฟล์ของแอป ไม่ปนกับเบราว์เซอร์

**การพัฒนาและ build** (ในโฟลเดอร์ `desktop/` ต้องมี Node.js):

```sh
cd desktop
npm install
npm start                 # รันแอปจากโค้ด
npm run smoke             # ทดสอบแอปจริงแบบ end-to-end (exit code 0 = ผ่าน)
npm run build:mac         # .dmg สำหรับ Apple Silicon และ Intel
npm run build:docker      # Windows .zip + Linux .AppImage (build ใน Docker)
```

- **Windows และ Linux:** เครื่องมือแพ็กของสองระบบนี้เป็นโปรแกรม Intel (x86-64) อย่างเดียว บน Mac Apple Silicon ที่ไม่มี Rosetta จึง build ใน Docker (`build-in-docker.sh` ใช้ image `electronuserland/builder:wine`) ถ้าใช้เครื่อง Intel หรือติดตั้ง Rosetta แล้ว ใช้ `npm run build:win` / `build:linux` ได้เลย
- **ตัวติดตั้ง Windows:** ตัวติดตั้ง `.exe` (NSIS) ต้องใช้ wine ซึ่งพังเมื่อจำลอง CPU บน Apple Silicon ให้ build บนเครื่อง Windows ด้วย `npm run build:win-installer` ตัวติดตั้งยังผูกไฟล์ .md กับแอปให้ ซึ่งแบบ .zip ทำไม่ได้
- **การเซ็นแอป:** build ของ macOS เซ็นแบบ ad-hoc (`build/adhoc-sign.js`) เพราะ Apple Silicon ไม่ยอมรันโค้ดที่ไม่มีลายเซ็นเลย ถ้าต้องการให้ไม่มีคำเตือนตอนเปิดครั้งแรก ต้องมี Apple Developer ID ($99/ปี และ notarize) และ code-signing certificate ของ Windows
- **ถ้าแอปเปิดขึ้นมาเป็น Node.js ธรรมดา** (`app` เป็น undefined): terminal มีตัวแปร `ELECTRON_RUN_AS_NODE=1` อยู่ (VS Code อาจตั้งไว้) ให้รัน `unset ELECTRON_RUN_AS_NODE` ก่อน

---

## โครงสร้างโปรเจค

```
.
├── markdownReader.html   # ตัวแอปทั้งหมด (HTML + CSS + JS)
├── lib/
│   ├── marked.min.js     # marked v15.0.12 — แปลง Markdown เป็น HTML
│   ├── purify.min.js     # DOMPurify v3.2.6 — กรอง HTML กัน XSS
│   ├── highlight.min.js  # highlight.js v11.11.1 (common languages) — ระบายสีโค้ด
│   ├── hljs-dockerfile.min.js  # ไวยากรณ์เพิ่มเติมของ highlight.js
│   └── hljs-nginx.min.js       # ไวยากรณ์เพิ่มเติมของ highlight.js
├── tests/
│   ├── index.html        # ชุดทดสอบ (รันในเบราว์เซอร์)
│   ├── run.sh            # สั่งรันทดสอบด้วย headless Chrome
│   └── server.py         # server ที่รับผลทดสอบมาแสดงใน terminal
├── desktop/              # แอปเดสก์ท็อป (Electron)
│   ├── main.js           # main process: หน้าต่าง เมนู หน้าต่างเลือกไฟล์ และการอ่าน/เขียนไฟล์
│   ├── preload.js        # API เดียวที่หน้าเว็บเรียกได้ (window.desktop)
│   ├── smoke.js          # ทดสอบแอปจริง ใช้กับ `npm run smoke`
│   ├── build/            # ไอคอนแอป และ hook สำหรับเซ็นแบบ ad-hoc
│   ├── build-in-docker.sh  # build Windows + Linux ใน Docker
│   └── package.json      # Electron 45.1.0, electron-builder 26.18.0 และการตั้งค่า build
├── Dockerfile            # nginx:1.27-alpine + ไฟล์แอป
├── docker-compose.yml
├── nginx.conf
└── .dockerignore
```

## การทดสอบ

```sh
./tests/run.sh          # รันใน terminal (exit code 0 = ผ่านทั้งหมด)
./tests/run.sh --open   # เปิดหน้าผลทดสอบในเบราว์เซอร์
```
ต้องมี Google Chrome และ python3

แอปเดสก์ท็อปมีชุดทดสอบของตัวเองที่รันกับ Electron จริง: `cd desktop && npm run smoke`

ชุดทดสอบมี 57 ข้อ ครอบคลุม offline, การแสดงผล, การระบายสีโค้ด, ตัวเชื่อมไฟล์ของแอปเดสก์ท็อป (ใช้ `window.desktop` จำลอง), การกัน XSS, แถบเครื่องมือ, คีย์ลัด, การบันทึกอัตโนมัติ, แท็บ, การเปิด/บันทึกไฟล์, กรณีไม่มี File System Access API, การลากไฟล์มาวาง และ layout ทั้งจอใหญ่และจอมือถือ

วิธีทำงานของชุดทดสอบ:
1. `run.sh` เปิด `server.py` และ headless Chrome
2. หน้าทดสอบโหลดแอปใน iframe แล้วพิมพ์ กดปุ่ม และกดคีย์ลัดเหมือนผู้ใช้จริง
3. เมื่อเสร็จ หน้าทดสอบส่งผลไปที่ `server.py` ซึ่งพิมพ์ผลออก terminal แล้วจบการทำงาน

การเปิดหรือบันทึกไฟล์จริงต้องมีคนกดเลือกไฟล์และกดอนุญาต ชุดทดสอบจึงใช้ไฟล์จำลองแทน

## อัปเดตไลบรารี

ไลบรารีถูกล็อกเวอร์ชันไว้ ถ้าต้องการอัปเดต ให้ดาวน์โหลดเวอร์ชันใหม่มาทับ แล้วรันชุดทดสอบ:

```sh
curl -fL -o lib/marked.min.js https://cdn.jsdelivr.net/npm/marked@<เวอร์ชัน>/marked.min.js
curl -fL -o lib/purify.min.js https://cdn.jsdelivr.net/npm/dompurify@<เวอร์ชัน>/dist/purify.min.js
curl -fL -o lib/highlight.min.js https://cdnjs.cloudflare.com/ajax/libs/highlight.js/<เวอร์ชัน>/highlight.min.js
./tests/run.sh
```

ถ้าต้องการระบายสีภาษาที่ไม่อยู่ใน common bundle ให้ดาวน์โหลดไวยากรณ์ของภาษานั้นมาไว้ใน `lib/` แล้วเพิ่มแท็ก `<script>` ต่อจาก `highlight.min.js` ใน `markdownReader.html`:

```sh
curl -fL -o lib/hljs-<ภาษา>.min.js https://cdnjs.cloudflare.com/ajax/libs/highlight.js/<เวอร์ชัน>/languages/<ภาษา>.min.js
```

ไวยากรณ์ต้องเป็นเวอร์ชันเดียวกับ `highlight.min.js`

แอปเดสก์ท็อปคัดลอก `markdownReader.html` และ `lib/` ตอน build จึงต้อง build ใหม่ทุกครั้งที่แก้ไฟล์เหล่านี้

## ข้อจำกัด

- **การระบายสีโค้ดต้องระบุภาษา** บล็อกที่มีแค่ ``` เฉยๆ จะไม่ถูกระบายสี และภาษาที่ไม่อยู่ใน bundle ต้องเพิ่มไวยากรณ์เอง (ดูด้านบน)
- **ไม่รู้ว่าไฟล์ถูกแก้จากโปรแกรมอื่น** ถ้าโปรแกรมอื่นแก้ไฟล์เดียวกันขณะเปิดอยู่ แอปจะเขียนทับเมื่อบันทึกครั้งถัดไป
- **ข้อมูลอยู่แค่ในเบราว์เซอร์นั้น** งานในเบราว์เซอร์ไม่ sync ข้ามเครื่องหรือข้ามเบราว์เซอร์ ถ้าต้องการใช้ต่อที่อื่นให้บันทึกเป็นไฟล์
