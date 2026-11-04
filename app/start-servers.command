#!/bin/bash
# VideoFlow — start dev:server + dev:web + chrome (CDP)
DIR="$(cd "$(dirname "$0")" && pwd)"
osascript <<OSA
tell application "Terminal"
  activate
  do script "cd '$DIR' && npm run dev:server"
  do script "cd '$DIR' && npm run dev:web"
  do script "cd '$DIR' && npm run chrome"
end tell
OSA
