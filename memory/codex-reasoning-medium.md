---
name: codex-reasoning-medium
description: "Khi Claude gọi Codex CLI, phải chạy reasoning effort medium bằng `-c model_reasoning_effort=\"medium\"`, không dùng high mặc định của config (2026-11-08)"
metadata:
  node_type: memory
  type: feedback
  originSessionId: bb5dc709-7408-40b0-8196-ab2da87f58e3
  modified: 2026-11-08T02:13:48.662Z
---

Khi Claude gọi Codex CLI (`codex exec`), Claude phải thêm `-c model_reasoning_effort="medium"`. Người dùng yêu cầu ngày 2026-11-08.

**Why:** File `~/.codex/config.toml` của người dùng đặt `model_reasoning_effort = "high"`, model `gpt-5.6-sol`. Ngày 2026-11-08, Claude nhờ Codex viết kịch bản video cá thòi lòi với mức high. Codex chạy lâu, và người dùng yêu cầu lần sau chỉ dùng medium.

**How to apply:** Claude chỉ ghi đè mức này trong lệnh `codex exec`. Claude không sửa `~/.codex/config.toml`, vì người dùng dùng file đó cho phiên Codex riêng. Lệnh mẫu: `codex exec -s read-only -c model_reasoning_effort="medium" --skip-git-repo-check -C <thư mục> -o <file kết quả> - < prompt.md`.
