import { hasGame, createGame } from "../utils/wordChainGame.js";

export default {
  name: "noitu",
  description: "🎮 Bắt đầu game Nối Từ với bot (!noitu)",

  async execute(message) {
    const guildId = message.guildId;
    const channelId = message.channelId;

    if (!guildId) {
      return message.reply("❌ Lệnh này chỉ dùng được trong server.");
    }

    if (hasGame(guildId)) {
      return message.reply(
        "❌ Server này đang có một game nối từ. Dùng `/noitu-stop` để kết thúc trước."
      );
    }

    const game = createGame(guildId, channelId, "bot"); // !noitu luôn là bot mode
    const { phrase, currentWord } = game.start();

    await message.reply(
      `🎮 **Game Nối Từ bắt đầu!**\n` +
        `🤖 Bot mode – bạn chơi với bot\n\n` +
        `Từ đầu tiên: **${phrase}**\n\n` +
        `Từ tiếp theo phải bắt đầu bằng: **${currentWord}**`
    );
  },
};
