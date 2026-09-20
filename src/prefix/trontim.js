import { hasGame, createGame } from "../utils/hideAndSeekGame.js";
import { buildDoorsUI } from "../utils/hideAndSeekUI.js";

export default {
  name: "trontim",
  description: "🕵️ Bắt đầu game Trốn Tìm với bot (!trontim)",

  async execute(message) {
    const channelId = message.channelId;
    const initiator = message.author;

    if (hasGame(channelId)) {
      return message.reply(
        "❌ Kênh này đang có một ván trốn tìm chưa kết thúc. Dùng `/trontim-stop` để hủy trước."
      );
    }

    const game = createGame(channelId, "bot", null, initiator.id);

    const components = buildDoorsUI(game);
    await message.reply({
      content: `🕵️ **Trốn Tìm Bắt Đầu!**\n🤖 Bot đã trốn xong! <@${initiator.id}> có 5 lượt để mở cửa tìm kiếm. Chọn đi nào!\n\nLượt còn lại: **5**`,
      components,
    });
  },
};
