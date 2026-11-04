# Workflow JSON Schema

## Node types

### text
```json
{
  "id": "unique-id",
  "type": "text",
  "content": "nội dung prompt cố định"
}
```

### image
```json
{
  "id": "unique-id",
  "type": "image",
  "provider": "gemini | chatgpt",   // chỉ có khi node CÓ input (tự generate)
  "source": "person | clothing"      // chỉ có khi node là INPUT (nguồn ảnh từ user)
}
```

### video
```json
{
  "id": "unique-id",
  "type": "video",
  "provider": "flow | kling | grok",
  "config": {
    "model": "omni-flash | veo-3.1-fast | veo-3.1-quality | kling-video/v2.5-turbo",
    "durationSeconds": 4,
    "aspectRatio": "9:16 | 16:9 | 1:1"
  }
}
```

## Edge ports
- `prompt` — text node → image/video node
- `image`  — image node → image/video node (có thể nhiều)
- `start`  — image node → video node (frame đầu)
- `end`    — image node → video node (frame cuối)

## Edges
```json
{
  "id": "edge-id",
  "source": { "nodeId": "...", "port": "out" },
  "target": { "nodeId": "...", "port": "prompt | image | start | end" }
}
```
