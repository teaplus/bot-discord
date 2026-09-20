export const games = new Map(); // Map<channelId, GameSession>

const AFK_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export class GameSession {
  constructor({ channelId, mode, hiderId, seekerId }) {
    this.channelId = channelId;
    this.mode = mode; // 'bot' | 'player'
    this.hiderId = hiderId;
    this.seekerId = seekerId;
    this.hiddenRoom =
      mode === "bot"
        ? { x: Math.floor(Math.random() * 5), y: Math.floor(Math.random() * 5) }
        : null;
    this.guessedRooms = [];
    this.attemptsLeft = 5;
    this.status = mode === "bot" ? "PLAYING" : "WAITING_HIDER"; // 'WAITING_HIDER' | 'PLAYING' | 'FINISHED'
    this.timeoutTimer = null;
    this.resetTimeout();
  }

  resetTimeout() {
    if (this.timeoutTimer) clearTimeout(this.timeoutTimer);
    this.timeoutTimer = setTimeout(() => {
      this.end();
    }, AFK_TIMEOUT);
  }

  hideInRoom(x, y) {
    if (this.status !== "WAITING_HIDER") return false;
    this.hiddenRoom = { x, y };
    this.status = "PLAYING";
    this.resetTimeout();
    return true;
  }

  guessRoom(x, y) {
    if (this.status !== "PLAYING") return { valid: false };
    if (this.guessedRooms.some((r) => r.x === x && r.y === y))
      return { valid: false };

    this.guessedRooms.push({ x, y });
    this.attemptsLeft--;
    this.resetTimeout();

    const distance =
      Math.abs(this.hiddenRoom.x - x) + Math.abs(this.hiddenRoom.y - y);
    let hint = "";
    let result = "";

    if (distance === 0) {
      this.status = "FINISHED";
      result = "WIN";
      hint = "🎉 CHÍNH XÁC!";
    } else {
      if (distance === 1) {
        hint = "🔴 Rất Nóng! Sát vách rồi, tiếng thở ở ngay cạnh!";
      } else if (distance === 2) {
        hint = "🟡 Ấm. Có tiếng sột soạt lờ mờ gần đây.";
      } else {
        hint = "🔵 Lạnh ngắt. Xung quanh im ắng, sai khu vực rồi.";
      }

      if (this.attemptsLeft <= 0) {
        this.status = "FINISHED";
        result = "LOSE";
      } else {
        result = "CONTINUE";
      }
    }

    if (this.status === "FINISHED") this.clearTimeout();

    return { valid: true, result, hint, distance };
  }

  clearTimeout() {
    if (this.timeoutTimer) clearTimeout(this.timeoutTimer);
  }

  end() {
    this.status = "FINISHED";
    this.clearTimeout();
    games.delete(this.channelId);
  }
}

export function getGame(channelId) {
  return games.get(channelId) || null;
}

export function hasGame(channelId) {
  return games.has(channelId);
}

export function createGame(channelId, mode, hiderId, seekerId) {
  const session = new GameSession({ channelId, mode, hiderId, seekerId });
  games.set(channelId, session);
  return session;
}

export function endGame(channelId) {
  const game = games.get(channelId);
  if (game) game.end();
}
