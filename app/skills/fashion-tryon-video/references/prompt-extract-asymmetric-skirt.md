# Prompt tách đồ — bộ có chân váy xiên/asymmetric hem

Dùng khi sản phẩm có chân váy gấu xiên (high-low, handkerchief, asymmetric diagonal cut).
Thay phần mô tả váy bằng đoạn dưới đây trong prompt tách đồ (bước 1 ChatGPT).

## Template prompt đoạn mô tả chân váy xiên

```
3. Brown polka-dot skirt — CRITICAL DETAILS:
   - Dark chocolate brown fabric with large white polka dots
   - ASYMMETRIC HEM: the hemline is diagonal/slanted — one side is noticeably longer/lower
     than the other side (high-low hem / handkerchief-style diagonal cut)
   - The hem is NOT straight and NOT even — it cuts diagonally across
   - Flowy chiffon/voile fabric, midi length on the longer side
   - Gathered/ruched waistband
   - Recreate the skirt showing the DIAGONAL asymmetric hemline accurately
```

## Prompt đầy đủ đã dùng (session June 2026, Shopee link áo ren + chân váy nâu chấm bi)

```
Analyze the attached fashion photo in extreme detail and extract ALL clothing items and shoes
as individual product images on a pure white background.

Items to extract:
1. Pink lace crop top / bralette (two thin straps, lace fabric, dusty pink)
2. White sheer lace bolero cardigan (long sleeves, open front, no buttons, delicate floral lace)
3. Brown polka-dot skirt — CRITICAL DETAILS:
   - Dark chocolate brown fabric with large white polka dots
   - ASYMMETRIC HEM: the hemline is diagonal/slanted — one side is noticeably longer/lower
     than the other side (high-low hem / handkerchief-style diagonal cut)
   - The hem is NOT straight and NOT even — it cuts diagonally across
   - Flowy chiffon/voile fabric, midi length on the longer side
   - Gathered/ruched waistband
   - Recreate the skirt showing the DIAGONAL asymmetric hemline accurately
4. White Mary Jane flat shoes (perforated/cutout toe design, ankle strap with buckle, flat sole)

For each item:
- White background (#FFFFFF), no shadows, no reflections
- Soft studio lighting, accurate colors
- Do NOT include body parts
- Do NOT merge items
- 99% visual accuracy — especially the skirt's asymmetric diagonal hem
- Photorealistic, high resolution, no CGI or illustration
```

## Ghi chú

- Prompt này dùng ChatGPT (chatgptGenerateImage) — tốt hơn Gemini cho bước tách đồ product isolation
- Gemini dùng cho bước 2 (ghép đồ vào người) vì ChatGPT chặn try-on người thật
- Prompt ghép đồ (bước 2 Gemini) cũng cần nhắc lại: "high-low asymmetric hem skirt" trong PROMPT_TRYON
  để Gemini giữ đúng kiểu gấu váy khi mặc vào người mẫu
