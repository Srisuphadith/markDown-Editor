"""Static file server for the test page.

Serves the project root and waits for the test page to POST its plain-text
report to /__report, prints it, then exits (0 = all passed, 1 = failures).
"""
import http.server
import sys
import threading

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
TIMEOUT = float(sys.argv[2]) if len(sys.argv) > 2 else 180
result = {}


class Handler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path != '/__report':
            self.send_error(404)
            return
        body = self.rfile.read(int(self.headers.get('Content-Length', 0))).decode('utf-8')
        self.send_response(204)
        self.end_headers()
        result['text'] = body
        threading.Thread(target=self.server.shutdown).start()

    def end_headers(self):
        # Always serve the latest files
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def log_message(self, *args):
        pass


server = http.server.ThreadingHTTPServer(('127.0.0.1', PORT), Handler)
watchdog = threading.Timer(TIMEOUT, server.shutdown)
watchdog.daemon = True
watchdog.start()
server.serve_forever()
text = result.get('text', '')
print(text or f'หมดเวลา {TIMEOUT:.0f}s — ไม่ได้รับผลการทดสอบ')
sys.exit(0 if ', 0 failed' in text else 1)
