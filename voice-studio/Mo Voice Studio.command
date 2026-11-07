#!/bin/zsh
# Double-click in Finder: starts the server if it is not running, then opens the browser.
cd "$(dirname "$0")"
if ! curl -s -o /dev/null http://127.0.0.1:8765/api/status; then
  nohup ./start.sh > server.log 2>&1 &
  for i in {1..30}; do curl -s -o /dev/null http://127.0.0.1:8765/api/status && break; sleep 1; done
fi
open http://localhost:8765
