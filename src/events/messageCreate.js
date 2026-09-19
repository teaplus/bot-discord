const PREFIX = '!';

export default {
  name: 'messageCreate',
  once: false,

  async execute(message, client) {
    // Bỏ qua bot và tin nhắn không có prefix
    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
    const commandName = args.shift().toLowerCase();

    const command = client.prefixCommands.get(commandName);
    if (!command) return;

    try {
      await command.execute(message, args);
    } catch (error) {
      console.error(`❌ Lỗi khi chạy !${commandName}:`, error);
      await message.reply('⚠️ Có lỗi xảy ra khi thực hiện lệnh!');
    }
  },
};

