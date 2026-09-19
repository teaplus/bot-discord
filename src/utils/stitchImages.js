import sharp from "sharp";
import { getImageWithBg } from "./queDich.js";

// ── Config ─────────────────────────────────────────────────────────────────
const CARD_H = 200;
const GAP_X = 20;
const GAP_Y = 20;
const PADDING = 24;
const BG = { r: 255, g: 255, b: 255, alpha: 1 };

// ── Layout: N lá → bố cục hàng ────────────────────────────────────────────
const LAYOUTS = {
  3: [[3]],
  5: [[3], [2]],
  7: [[4], [3]],
};

function getLayout(n) {
  if (LAYOUTS[n]) return LAYOUTS[n];
  // Fallback: tối đa 4 cột/hàng
  const rows = [];
  for (let i = 0; i < n; i += 4) rows.push([Math.min(4, n - i)]);
  return rows;
}

// ── Fetch 1 ảnh từ URL → buffer đã có nền trắng + resize ─────────────────
async function fetchCard(imageUrl) {
  const url = getImageWithBg(imageUrl);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Lỗi fetch ảnh: ${res.status} ${url}`);

  const buf = Buffer.from(await res.arrayBuffer());

  return sharp(buf)
    .resize({ height: CARD_H, fit: "contain", background: BG })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .png()
    .toBuffer();
}

// ── Ghép N ảnh thành 1 ảnh lưới ─────────────────────────────────────────
export async function stitchCards(imageUrls) {
  // Fetch song song tất cả ảnh
  const cardBufs = await Promise.all(imageUrls.map(fetchCard));

  // Lấy metadata chiều rộng sau resize
  const metas = await Promise.all(cardBufs.map((b) => sharp(b).metadata()));
  const cardW = Math.max(...metas.map((m) => m.width)); // cột đều nhau

  const layout = getLayout(imageUrls.length);
  const maxCols = Math.max(...layout.map((r) => r[0]));
  const nRows = layout.length;

  const totalW = maxCols * cardW + (maxCols - 1) * GAP_X + PADDING * 2;
  const totalH = nRows * CARD_H + (nRows - 1) * GAP_Y + PADDING * 2;

  // Tính vị trí composite từng ảnh
  const composites = [];
  let cardIdx = 0;
  let y = PADDING;

  for (const [cols] of layout) {
    const rowBufs = cardBufs.slice(cardIdx, cardIdx + cols);
    const rowTotalW = cols * cardW + (cols - 1) * GAP_X;
    let x = Math.round((totalW - rowTotalW) / 2); // căn giữa hàng ngắn

    for (const buf of rowBufs) {
      composites.push({ input: buf, left: x, top: y });
      x += cardW + GAP_X;
    }

    cardIdx += cols;
    y += CARD_H + GAP_Y;
  }

  // Vẽ lên canvas trắng
  return sharp({
    create: { width: totalW, height: totalH, channels: 4, background: BG },
  })
    .composite(composites)
    .png()
    .toBuffer();
}
