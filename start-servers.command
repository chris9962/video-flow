#!/bin/bash
# VideoFlow — start dev:server + dev:web + chrome (CDP)
cd "$(dirname "$0")"
osascript <<'OSA'
tell application "Terminal"
  activate
  do script "cd /Users/nguyentruong/video-flow && npm run dev:server"
  do script "cd /Users/nguyentruong/video-flow && npm run dev:web"
  do script "cd /Users/nguyentruong/video-flow && npm run chrome"
end tell
OSA
