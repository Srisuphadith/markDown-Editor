#!/bin/sh
# Run the browser test suite in headless Chrome.
#   ./tests/run.sh            -> run in terminal (exit code 0 = all passed)
#   ./tests/run.sh --open     -> start a server and open the test page in your browser
cd "$(dirname "$0")/.."

PORT=${PORT:-8765}
URL="http://127.0.0.1:$PORT/tests/index.html"
CHROME=${CHROME:-"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"}
TIMEOUT=${TIMEOUT:-180}

if [ "$1" = "--open" ]; then
  python3 -m http.server "$PORT" --bind 127.0.0.1 >/dev/null 2>&1 &
  SERVER=$!
  trap 'kill $SERVER 2>/dev/null' EXIT INT TERM
  sleep 1
  open "$URL"
  echo "เปิด $URL แล้ว — กด Ctrl+C เพื่อหยุด server"
  wait $SERVER
  exit 0
fi

# The server prints the report and exits once the page posts it (or after $TIMEOUT seconds)
python3 tests/server.py "$PORT" "$TIMEOUT" &
SERVER=$!
sleep 1

PROFILE=$(mktemp -d)
"$CHROME" --headless=new --disable-gpu --no-first-run --user-data-dir="$PROFILE" \
  --window-size=1400,900 "$URL" >/dev/null 2>&1 &
BROWSER=$!

wait $SERVER
STATUS=$?
kill $BROWSER 2>/dev/null
wait $BROWSER 2>/dev/null
rm -rf "$PROFILE"
exit $STATUS
