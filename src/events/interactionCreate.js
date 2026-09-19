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
    }
  },
};

