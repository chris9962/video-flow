---
name: chrome-cdp-mo-tay
description: "Mở Chrome CDP (cổng 9222) bằng tay khi `npm run chrome` không chạy: dùng bash, không dùng PowerShell Start-Process vì tham số có dấu cách bị tách"
metadata:
  type: project
---

Ngày 2026-11-14 cổng 9222 không có Chrome. Mở bằng PowerShell `Start-Process chrome.exe -ArgumentList '--profile-directory=Profile 2',...` thì Chrome nhận `--profile-directory=Profile` (dấu cách tách tham số) và tạo profile mới tên "Profile" chưa đăng nhập; `muse.mjs` báo "Không mở được tab trong profile my". Thư mục rác `~/chrome-cdp-profile/Profile` vẫn còn (lệnh xoá bị chặn), vô hại.

**Why:** `npm run chrome` ép `--profile-directory=Default`, còn việc của Diễm My cần Profile 2 nên phải mở tay.

**How to apply:** Mở bằng Bash:
```bash
("/c/Program Files/Google/Chrome/Application/chrome.exe" --remote-debugging-port=9222 --user-data-dir="C:\Users\ADMIN\chrome-cdp-profile" --profile-directory="Profile 2" --disable-extensions --no-first-run --no-default-browser-check https://muse.ai/ >/dev/null 2>&1 &)
```
Kiểm tra bằng `node .claude/skills/flow-chain-video/scripts/chrome-profile.mjs` (phải in "Context mặc định: Profile 2"). Đóng Chrome CDP sai bằng CDP `Browser.close` (playwright-core nằm trong `app/node_modules`, script tạm phải đặt trong `.claude/skills/*/scripts/` mới import được). Liên quan [[chrome-profile-tai-khoan]].

**Thêm cửa sổ Profile 3/4 (2026-11-15):** sau khi Chrome CDP đã chạy với Profile 2, gọi lại chrome.exe cùng `--user-data-dir` nhưng `--profile-directory="Profile 3"` (rồi `"Profile 4"`), không cần `--remote-debugging-port`; Chrome mở thêm cửa sổ trong cùng tiến trình. `dang-tiktok.mjs --profile derpy|khoaikai` cần sẵn cửa sổ này. Dùng `nohup ... >/dev/null 2>&1 &` trong Bash; `cygpath -w ~/chrome-cdp-profile` cho đường dẫn Windows.
