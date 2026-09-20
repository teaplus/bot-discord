import { getGame, endGame } from '../utils/hideAndSeekGame.js';
import { buildDoorsUI } from '../utils/hideAndSeekUI.js';

const PREFIX = '!';

export default {
  name: 'interactionCreate',
  once: false,

  async execute(interaction, client) {
    // ── Slash Commands ────────────────────────────────────────────────────────
    if (interaction.isChatInputCommand()) {
      const command = client.slashCommands.get(interaction.commandName);

      if (!command) {
        console.warn(`❓ Không tìm thấy slash command: ${interaction.commandName}`);
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(`❌ Lỗi khi chạy /${interaction.commandName}:`, error);
        const msg = { content: '⚠️ Có lỗi xảy ra khi thực hiện lệnh!', ephemeral: true };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(msg);
        } else {
          await interaction.reply(msg);
        }
      }
      return;
    }

    // ── Button Interactions ───────────────────────────────────────────────────
    if (interaction.isButton()) {
      const customId = interaction.customId;

      if (customId.startsWith('trontim_')) {
        const game = getGame(interaction.channelId);

        if (!game) {
          return interaction.reply({
            content: '❌ Không có game trốn tìm nào đang chạy hoặc game đã kết thúc.',
            ephemeral: true
          });
        }

        // Hider chọn phòng
        if (customId.startsWith('trontim_hide_')) {
          if (interaction.user.id !== game.hiderId) {
            return interaction.reply({ content: '⚠️ Chỉ người trốn mới có thể chọn phòng!', ephemeral: true });
          }

          const room = parseInt(customId.replace('trontim_hide_', ''), 10);
          const success = game.hideInRoom(room);

          if (!success) {
            return interaction.reply({ content: '⚠️ Không thể chọn phòng lúc này!', ephemeral: true });
          }

          // Cập nhật tin nhắn ephemeral (xóa nút)
          await interaction.update({
            content: `🤫 Bạn đã trốn vào **Phòng ${room}**! Đang đợi Seeker tìm kiếm...`,
            components: []
          });

          // Gửi tin nhắn public cho Seeker bắt đầu tìm
          const components = buildDoorsUI(game);
          await interaction.channel.send({
            content: `🕵️ **Trốn Tìm Bắt Đầu!**\n<@${game.hiderId}> đã trốn xong! <@${game.seekerId}> có 3 lượt để mở cửa tìm kiếm. Chọn đi nào!\n\nLượt còn lại: **3**`,
            components
          });
          return;
        }

        // Seeker chọn phòng
        if (customId.startsWith('trontim_room_')) {
          if (interaction.user.id !== game.seekerId) {
            return interaction.reply({ content: '⚠️ Chỉ người tìm mới được bấm mở cửa!', ephemeral: true });
          }

          const room = parseInt(customId.replace('trontim_room_', ''), 10);
          const resultObj = game.guessRoom(room);

          if (!resultObj.valid) {
            return interaction.reply({ content: '⚠️ Không thể mở cửa này!', ephemeral: true });
          }

          let newContent = '';
          const components = buildDoorsUI(game, game.status === 'FINISHED');

          if (resultObj.result === 'WIN') {
            newContent = `🎉 **CHÍNH XÁC!** <@${game.seekerId}> đã tóm được ${game.mode === 'bot' ? '🤖 Bot' : `<@${game.hiderId}>`} ở **Phòng ${room}**!`;
            endGame(interaction.channelId); // xóa khỏi map RAM
          } else if (resultObj.result === 'LOSE') {
            newContent = `💀 **HẾT LƯỢT!** ${game.mode === 'bot' ? '🤖 Bot' : `<@${game.hiderId}>`} đã trốn thoát thành công.\n\nVị trí thực sự là **Phòng ${game.hiddenRoom}**.`;
            endGame(interaction.channelId); // xóa khỏi map RAM
          } else {
            newContent = `🕵️ **Trốn Tìm Đang Diễn Ra!**\n<@${game.seekerId}> đang tìm kiếm...\n\n${resultObj.hint}\nLượt còn lại: **${game.attemptsLeft}**`;
          }

          await interaction.update({
            content: newContent,
            components
          });
          return;
        }
      }
    }
  },
};

