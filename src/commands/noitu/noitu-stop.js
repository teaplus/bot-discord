import { SlashCommandBuilder } from "discord.js";
import { getGame, endGame } from "../../utils/wordChainGame.js";

export default {
  data: new SlashCommandBuilder()
    .setName("noitu-stop")
    .setDescription("🛑 Kết thúc game Nối Từ đang chạy"),

  async execute(interaction) {
    const game = getGame(interaction.guildId);

    if (!game) {
      return interaction.reply({
        content: "Không có game nối từ đang chạy.",
        ephemeral: true,
      });
    }

    endGame(interaction.guildId);

    await interaction.reply("🛑 Game nối từ đã kết thúc.");
  },
};
