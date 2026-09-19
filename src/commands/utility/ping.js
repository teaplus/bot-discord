import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('🏓 Kiểm tra độ trễ của bot'),

  async execute(interaction) {
    const sent = await interaction.reply({
      content: '🏓 Pinging...',
      fetchReply: true,
    });

    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(interaction.client.ws.ping);

    await interaction.editReply(
      `🏓 **Pong!**\n` +
      `📶 Độ trễ bot: \`${latency}ms\`\n` +
      `💓 API latency: \`${apiLatency}ms\``
    );
  },
};

