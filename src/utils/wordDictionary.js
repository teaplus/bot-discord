import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WORDS_PATH = join(__dirname, "../../assets/words/words.txt");

// ── Normalize: trim + lowercase theo tiếng Việt ─────────────────────────────
export function normalizeWord(str) {
  return str.trim().toLocaleLowerCase("vi-VN");
}

// ── Dictionary: Map<string, Set<string>> ─────────────────────────────────────
// Load một lần khi module được import lần đầu
export const dictionary = new Map();

const raw = readFileSync(WORDS_PATH, "utf-8");
let loaded = 0;

for (const line of raw.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed) continue;
  const parts = trimmed.split(/\s+/);
  if (parts.length !== 2) continue;
  const [w1, w2] = [normalizeWord(parts[0]), normalizeWord(parts[1])];
  if (!w1 || !w2) continue;
  if (!dictionary.has(w1)) dictionary.set(w1, new Set());
  dictionary.get(w1).add(w2);
  loaded++;
}

console.log(
  `📚 Dictionary loaded: ${loaded} cặp từ, ${dictionary.size} từ đầu`
);

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Lấy các từ có thể nối tiếp word, loại bỏ phrase đã dùng */
export function getCandidates(word, usedPhrases) {
  const nexts = dictionary.get(normalizeWord(word));
  if (!nexts) return [];
  const result = [];
  for (const next of nexts) {
    if (!usedPhrases.has(`${normalizeWord(word)} ${next}`)) {
      result.push(next);
    }
  }
  return result;
}

/** Kiểm tra (w1, w2) có tồn tại trong từ điển không */
export function isValidPair(w1, w2) {
  const n1 = normalizeWord(w1);
  const n2 = normalizeWord(w2);
  return dictionary.has(n1) && dictionary.get(n1).has(n2);
}

/** Lấy ngẫu nhiên 1 cặp từ hợp lệ để bắt đầu game */
export function getRandomStartPhrase() {
  const keys = [...dictionary.keys()];
  for (let i = 0; i < 2000; i++) {
    const w1 = keys[Math.floor(Math.random() * keys.length)];
    const nexts = [...dictionary.get(w1)];
    if (nexts.length > 0) {
      const w2 = nexts[Math.floor(Math.random() * nexts.length)];
      return { phrase: `${w1} ${w2}`, firstWord: w1, secondWord: w2 };
    }
  }
  throw new Error("Không tìm được phrase bắt đầu hợp lệ");
}
