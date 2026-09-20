import { SlashCommandBuilder } from 'discord.js';
import { hasGame, createGame } from '../../utils/hideAndSeekGame.js';
import { buildDoorsUI, buildHiderUI } from '../../utils/hideAndSeekUI.js';

export default {
  data: new SlashCommandBuilder()
    .setName('trontim')
    .setDescription('🕵️ Bắt đầu game Trốn Tìm')
    .addStringOption(opt =>
      opt.setName('mode')
         .setDescription('Chế độ chơi (bot đi trốn hoặc người đi trốn)')
         .setRequired(true)
         .addChoices(
           { name: 'Bot đi trốn 🤖', value: 'bot' },
           { name: 'Người đi trốn 👥', value: 'player' }
         )
    )
    .addUserOption(opt =>
      opt.setName('target')
         .setDescription('Người bạn muốn thách đấu (Bắt buộc nếu chọn Người đi trốn)')
    ),

  async execute(interaction) {
    const channelId = interaction.channelId;
    const mode = interaction.options.getString('mode');
    const target = interaction.options.getUser('target');
    const initiator = interaction.user;

    if (hasGame(channelId)) {
      return interaction.reply({
        content: '❌ Kênh này đang có một ván trốn tìm chưa kết thúc. Dùng `/trontim-stop` để hủy trước.',
        ephemeral: true
      });
    }

    if (mode === 'player' && !target) {
      return interaction.reply({
        content: '⚠️ Bạn phải chọn `target` (người tìm) khi chơi chế độ Người đi trốn!',
        ephemeral: true
      });
    }

    if (mode === 'player' && target.id === initiator.id) {
      return interaction.reply({
        content: '⚠️ Bạn không thể tự chơi trốn tìm với chính mình!',
        ephemeral: true
      });
    }
    
    if (mode === 'player' && target.bot) {
      return interaction.reply({
        content: '⚠️ Không thể chọn target là bot trong chế độ người!',
        ephemeral: true
      });
    }

    if (mode === 'bot') {
      const game = createGame(channelId, 'bot', null, initiator.id);
      
      const components = buildDoorsUI(game);
      await interaction.reply({
        content: `🕵️ **Trốn Tìm Bắt Đầu!**\n🤖 Bot đã trốn xong! <@${initiator.id}> có 3 lượt để mở cửa tìm kiếm. Chọn đi nào!\n\nLượt còn lại: **3**`,
        components
      });

    } else {
      // player mode
      const game = createGame(channelId, 'player', initiator.id, target.id);
      
      const components = buildHiderUI();
      // Ephemeral message for Hider to select room
      await interaction.reply({
        content: `🤫 **Thời gian ẩn nấp!**\nHãy chọn 1 trong 10 phòng bên dưới để trốn.`,
        components,
        ephemeral: true
      });
    }
  }
};

