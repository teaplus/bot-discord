import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Đọc JSON một lần, cache lại trong memory
const DATA_PATH = join(__dirname, "../../64QueKinhDich.json");
const queData = JSON.parse(readFileSync(DATA_PATH, "utf-8"));

/**
 * Lấy toàn bộ 64 quẻ
 */
export function getAllQue() {
  return queData;
}

/**
 * Lấy 1 quẻ ngẫu nhiên
 */
export function getRandomQue() {
  const index = Math.floor(Math.random() * queData.length);
  return queData[index];
}

/**
 * Lấy quẻ theo số thứ tự (1-64)
 */
export function getQueByNumber(num) {
  return queData.find((q) => q.id === num - 1) ?? null;
}

/**
 * Tìm quẻ theo tên (tìm kiếm mờ)
 */
export function searchQueByName(keyword) {
  const lower = keyword.toLowerCase();
  return queData.filter((q) => q.name.toLowerCase().includes(lower));
}

/**
 * Map type → màu embed và emoji
 */
export function getTypeStyle(type) {
  const styles = {
    "Đại Cát": { color: 0xffd700, emoji: "🟡", label: "Đại Cát ✨" },
    Cát: { color: 0x57f287, emoji: "🟢", label: "Cát 🍀" },
    Hung: { color: 0xed4245, emoji: "🔴", label: "Hung ⚠️" },
    Bình: { color: 0x95a5a6, emoji: "⚪", label: "Bình 🌫️" },
  };
  return styles[type] ?? { color: 0x5865f2, emoji: "🔮", label: type };
}

/**
 * Wrap URL ảnh qua weserv.nl để thêm nền trắng (không cần thư viện)
 * Ví dụ: https://images.weserv.nl/?url=sodep.dabala.vn/que/1.png&bg=white
 */
export function getImageWithBg(imageUrl, bg = 'white') {
  // Bỏ https:// để weserv.nl nhận đúng
  const cleanUrl = imageUrl.replace(/^https?:\/\//, '');
  return `https://images.weserv.nl/?url=${cleanUrl}&bg=${bg}&output=png`;
}
