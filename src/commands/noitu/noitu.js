import { SlashCommandBuilder } from "discord.js";
import { hasGame, createGame } from "../../utils/wordChainGame.js";

export default {
  data: new SlashCommandBuilder()
    .setName("noitu")
    .setDescription("🎮 Bắt đầu game Nối Từ tiếng Việt")
    .addStringOption((opt) =>
      opt
        .setName("mode")
        .setDescription("Chế độ chơi")
        .setRequired(true)
        .addChoices(
          { name: "Chơi với Bot 🤖", value: "bot" },
          { name: "Chơi với nhau 👥", value: "player" }
        )
    ),

  async execute(interaction) {
    const guildId = interaction.guildId;
    const channelId = interaction.channelId;
    const mode = interaction.options.getString("mode");

    if (hasGame(guildId)) {
      return interaction.reply({
        content:
          "❌ Server này đang có một game nối từ. Dùng `/noitu-stop` để kết thúc trước.",
        ephemeral: true,
      });
    }

    const game = createGame(guildId, channelId, mode);
    const { phrase, currentWord } = game.start();

    const modeLabel =
      mode === "bot"
        ? "🤖 Bot mode – bạn chơi với bot"
        : "👥 Player mode – người chơi với người";

    await interaction.reply(
      `🎮 **Game Nối Từ bắt đầu!**\n` +
        `${modeLabel}\n\n` +
        `Từ đầu tiên: **${phrase}**\n\n` +
        `Từ tiếp theo phải bắt đầu bằng: **${currentWord}**`
    );
  },
};
