@echo off
rem Mở Voice Studio trên Windows: http://localhost:8765 (chỉ máy này). Bản macOS là start.sh.
cd /d "%~dp0"
if "%PORT%"=="" set PORT=8765
".venv\Scripts\uvicorn.exe" app.main:app --host 127.0.0.1 --port %PORT%
