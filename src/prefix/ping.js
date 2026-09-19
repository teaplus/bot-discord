export default {
  name: 'ping',
  description: 'Kiểm tra bot còn sống không bằng prefix !ping',

  async execute(message) {
    const sent = await message.reply('🏓 Pinging...');

    const latency = sent.createdTimestamp - message.createdTimestamp;
    const apiLatency = Math.round(message.client.ws.ping);

    await sent.edit(
      `🏓 **Pong!**\n` +
      `📶 Độ trễ bot: \`${latency}ms\`\n` +
      `💓 API latency: \`${apiLatency}ms\``
    );
  },
};

