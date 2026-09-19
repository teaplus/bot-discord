import { EmbedBuilder } from 'discord.js';
import { getRandomQue, getTypeStyle, getImageWithBg } from '../utils/queDich.js';

export default {
  name: 'rutque',
  description: 'Rut mot que Kinh Dich ngau nhien',

  async execute(message) {
    const que = getRandomQue();
    const { color, label } = getTypeStyle(que.type);

    const embed = new EmbedBuilder()
      .setTitle('🔮 ' + que.full_title)
      .setThumbnail(getImageWithBg(que.image))
      .setDescription(que.description)
      .setColor(color)
      .addFields({ name: '📊 Phan doan', value: label, inline: true })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  },
};