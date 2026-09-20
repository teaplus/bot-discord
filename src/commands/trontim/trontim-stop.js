import { SlashCommandBuilder } from 'discord.js';
import { getGame, endGame } from '../../utils/hideAndSeekGame.js';

export default {
  data: new SlashCommandBuilder()
    .setName('trontim-stop')
    .setDescription('🛑 Kết thúc game Trốn Tìm hiện tại'),

  async execute(interaction) {
    const game = getGame(interaction.channelId);

    if (!game) {
      return interaction.reply({
        content: 'Không có game trốn tìm nào đang chạy trong kênh này.',
        ephemeral: true
      });
    }

    endGame(interaction.channelId);

    await interaction.reply('🛑 Game trốn tìm đã bị hủy.');
  }
};

