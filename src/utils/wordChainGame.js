import {
  getCandidates,
  getRandomStartPhrase,
  isValidPair,
  normalizeWord,
} from "./wordDictionary.js";

const MAX_WRONG = 5; // sai bao nhiêu lần thì lock
const LOCK_LIMIT = 3; // bao nhiêu người lock thì game over

// ── GameSession ───────────────────────────────────────────────────────────────
export class GameSession {
  constructor({ guildId, channelId, mode }) {
    this.guildId = guildId;
    this.channelId = channelId;
    this.mode = mode; // 'bot' | 'player'
    this.currentWord = null;
    this.usedPhrases = new Set();
    this.wrongAttempts = new Map(); // userId → count (reset mỗi correct)
    this.lockedPlayers = new Set(); // userId (reset mỗi correct)
    this.players = new Set(); // tất cả người đã tham gia
    this.lastCorrectUserId = null; // chỉ track human, không track bot
    this.startedAt = Date.now();
    this.finished = false;
  }

  /** Khởi động game, trả về phrase đầu và currentWord */
  start() {
    const { phrase, secondWord } = getRandomStartPhrase();
    this.usedPhrases.add(phrase);
    this.currentWord = secondWord;
    return { phrase, currentWord: secondWord };
  }

  /** Xử lý câu trả lời của người chơi
   * @returns {{ type: string, ... }}
   */
  processAnswer(userId, input) {
    if (this.finished) return { type: "finished" };
    if (this.lockedPlayers.has(userId))
      return { type: "locked", currentWord: this.currentWord };

    const normalized = normalizeWord(input);
    const parts = normalized.split(/\s+/);

    // ── Sai format ──────────────────────────────────────────────────────────
    if (parts.length !== 2) {
      const wrongCount = this._addWrong(userId);
      return {
        type: "wrong_format",
        wrongCount,
        justLocked: wrongCount >= MAX_WRONG,
      };
    }

    const [w1, w2] = parts;
    const phrase = `${w1} ${w2}`;

    // ── Sai prefix ──────────────────────────────────────────────────────────
    if (w1 !== this.currentWord) {
      const wrongCount = this._addWrong(userId);
      return {
        type: "wrong_prefix",
        currentWord: this.currentWord,
        wrongCount,
        justLocked: wrongCount >= MAX_WRONG,
      };
    }

    // ── Phrase đã dùng ──────────────────────────────────────────────────────
    if (this.usedPhrases.has(phrase)) {
      const wrongCount = this._addWrong(userId);
      return {
        type: "already_used",
        wrongCount,
        justLocked: wrongCount >= MAX_WRONG,
      };
    }

    // ── Không có trong từ điển ──────────────────────────────────────────────
    if (!isValidPair(w1, w2)) {
      const wrongCount = this._addWrong(userId);
      return {
        type: "not_in_dict",
        phrase,
        wrongCount,
        justLocked: wrongCount >= MAX_WRONG,
      };
    }

    // ── Đúng! ────────────────────────────────────────────────────────────────
    this.usedPhrases.add(phrase);
    this.currentWord = w2;
    this.lastCorrectUserId = userId;
    this.players.add(userId);
    this.wrongAttempts.clear();
    this.lockedPlayers.clear();

    return { type: "correct", phrase, newCurrentWord: w2 };
  }

  /** Bot tự chọn từ tiếp theo (bot mode).
   * @returns {{ phrase, newCurrentWord }} | null nếu hết nước
   */
  getBotAnswer() {
    const candidates = getCandidates(this.currentWord, this.usedPhrases);
    if (candidates.length === 0) return null;

    // Ưu tiên candidate mà từ tiếp theo vẫn còn candidate (tránh dead-end)
    const smart = candidates.filter(
      (w2) => getCandidates(w2, this.usedPhrases).length > 0
    );
    const pool = smart.length > 0 ? smart : candidates;
    const chosen = pool[Math.floor(Math.random() * pool.length)];

    const phrase = `${this.currentWord} ${chosen}`;
    this.usedPhrases.add(phrase);
    this.currentWord = chosen;
    // Không cập nhật lastCorrectUserId → giữ nguyên người thắng cuối cùng là human
    this.wrongAttempts.clear();
    this.lockedPlayers.clear();

    return { phrase, newCurrentWord: chosen };
  }

  /** Kiểm tra game over sau mỗi sự kiện
   * @returns {{ reason: 'three_locked'|'no_candidates', winner: string|null }} | null
   */
  checkGameOver() {
    if (this.lockedPlayers.size >= LOCK_LIMIT) {
      return { reason: "three_locked", winner: this.lastCorrectUserId };
    }
    if (getCandidates(this.currentWord, this.usedPhrases).length === 0) {
      return { reason: "no_candidates", winner: this.lastCorrectUserId };
    }
    return null;
  }

  end() {
    this.finished = true;
  }

  // ── Private ────────────────────────────────────────────────────────────────
  _addWrong(userId) {
    const count = (this.wrongAttempts.get(userId) || 0) + 1;
    this.wrongAttempts.set(userId, count);
    if (count >= MAX_WRONG) this.lockedPlayers.add(userId);
    return count;
  }
}

// ── GameManager: Map<guildId, GameSession> ───────────────────────────────────
const games = new Map();

export function getGame(guildId) {
  return games.get(guildId) || null;
}
export function hasGame(guildId) {
  return games.has(guildId);
}

export function createGame(guildId, channelId, mode) {
  const session = new GameSession({ guildId, channelId, mode });
  games.set(guildId, session);
  return session;
}

export function endGame(guildId) {
  const game = games.get(guildId);
  if (game) game.end();
  games.delete(guildId);
}
