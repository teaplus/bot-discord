export const games = new Map(); // Map<channelId, GameSession>

const AFK_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export class GameSession {
  constructor({ channelId, mode, hiderId, seekerId }) {
    this.channelId = channelId;
    this.mode = mode; // 'bot' | 'player'
    this.hiderId = hiderId;
    this.seekerId = seekerId;
    this.hiddenRoom = mode === 'bot' ? Math.floor(Math.random() * 10) + 1 : null;
    this.guessedRooms = [];
    this.attemptsLeft = 3;
    this.status = mode === 'bot' ? 'PLAYING' : 'WAITING_HIDER'; // 'WAITING_HIDER' | 'PLAYING' | 'FINISHED'
    this.timeoutTimer = null;
    this.resetTimeout();
  }

  resetTimeout() {
    if (this.timeoutTimer) clearTimeout(this.timeoutTimer);
    this.timeoutTimer = setTimeout(() => {
      this.end();
      // Optional: we can't easily send a message from here without the channel object, 
      // but it safely clears from memory.
    }, AFK_TIMEOUT);
  }

  hideInRoom(roomNumber) {
    if (this.status !== 'WAITING_HIDER') return false;
    this.hiddenRoom = roomNumber;
    this.status = 'PLAYING';
    this.resetTimeout();
    return true;
  }

  guessRoom(roomNumber) {
    if (this.status !== 'PLAYING') return { valid: false };
    if (this.guessedRooms.includes(roomNumber)) return { valid: false };

    this.guessedRooms.push(roomNumber);
    this.attemptsLeft--;
    this.resetTimeout();

    const distance = Math.abs(this.hiddenRoom - roomNumber);
    let hint = '';
    let result = '';

    if (distance === 0) {
      this.status = 'FINISHED';
      result = 'WIN';
      hint = '🎉 CHÍNH XÁC!';
    } else {
      if (distance === 1) {
        hint = '🔴 Rất Nóng! Sát vách rồi, tiếng thở ở ngay cạnh!';
      } else if (distance === 2) {
        hint = '🟡 Ấm. Có tiếng sột soạt quanh khu vực này.';
      } else {
        hint = '🔵 Lạnh ngắt. Xung quanh im ắng, không có ai ở đây cả.';
      }

      if (this.attemptsLeft <= 0) {
        this.status = 'FINISHED';
        result = 'LOSE';
      } else {
        result = 'CONTINUE';
      }
    }

    if (this.status === 'FINISHED') this.clearTimeout();

    return { valid: true, result, hint, distance };
  }

  clearTimeout() {
    if (this.timeoutTimer) clearTimeout(this.timeoutTimer);
  }

  end() {
    this.status = 'FINISHED';
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

