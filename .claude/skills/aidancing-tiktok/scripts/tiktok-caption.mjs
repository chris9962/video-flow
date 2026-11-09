// Hàm dùng chung cho dang-tiktok.mjs và sua-mo-ta-tiktok.mjs.

// Gõ mô tả. Hashtag chỉ thành link bấm được khi chọn từ danh sách gợi ý (.hashtag-suggestion-item).
// Gõ "#tag " thường thì TikTok để là chữ thường (người xem báo ngày 2026-11-08, kênh @t.ht.n.mm).
// Không có gợi ý đúng y tag thì giữ chữ thường, không chọn tag khác.
export async function typeCaption(page, text) {
  const parts = text.trim().split(/(#[^\s#]+)/u).filter(Boolean);
  let linked = 0;
  let justLinked = false;
  const tags = [];
  for (let part of parts) {
    if (!part.startsWith('#')) {
      // Chọn gợi ý thì TikTok tự thêm 1 dấu cách sau hashtag.
      if (justLinked) part = part.replace(/^ /, '');
      justLinked = false;
      if (part) await page.keyboard.type(part, { delay: 40 });
      continue;
    }
    tags.push(part);
    await page.keyboard.type(part, { delay: 120 });
    const want = part.toLowerCase();
    let item = null;
    for (let i = 0; i < 16 && !item; i++) {
      await page.waitForTimeout(250);
      const items = page.locator('.hashtag-suggestion-item');
      const n = await items.count().catch(() => 0);
      for (let j = 0; j < n; j++) {
        const topic = (await items.nth(j).locator('.hash-tag-topic').innerText().catch(() => '')).trim().toLowerCase();
        if (topic === want) { item = items.nth(j); break; }
      }
    }
    if (item) {
      await item.click();
      linked++;
      justLinked = true;
      await page.waitForTimeout(300);
    } else {
      // Tag mới, không có gợi ý: danh sách gợi ý đang tải có thể nuốt 1 phím (#tuhatdenmam thành #tuhadenmam, 2026-11-08).
      // Xoá phần đã gõ sau dấu # cuối rồi chèn lại nguyên chữ.
      const editor = page.locator('[contenteditable="true"]').first();
      const now = (await editor.innerText()).replace(/\s+$/, '');
      if (!now.endsWith(part)) {
        const typed = now.length - now.lastIndexOf('#');
        for (let k = 0; k < typed; k++) await page.keyboard.press('Backspace');
        await page.keyboard.insertText(part);
        await page.waitForTimeout(500);
      }
      await page.keyboard.type(' ');
      justLinked = true;
    }
  }
  return { linked, total: tags.length };
}

export const normalizeCaption = (t) => t.replace(/\s+/g, ' ').trim();
