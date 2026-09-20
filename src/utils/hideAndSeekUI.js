import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';

export function buildDoorsUI(game, showRealPosition = false) {
  const rows = [];
  let currentRow = new ActionRowBuilder();

  for (let i = 1; i <= 10; i++) {
    const btn = new ButtonBuilder()
      .setCustomId(`trontim_room_${i}`);

    const isGuessed = game.guessedRooms.includes(i);
    const isHiddenRoom = game.hiddenRoom === i;

    if (isGuessed) {
      if (isHiddenRoom) {
        btn.setLabel(`Phòng ${i}`)
           .setEmoji('👻')
           .setStyle(ButtonStyle.Success)
           .setDisabled(true);
      } else {
        btn.setLabel(`Phòng ${i}`)
           .setEmoji('💨')
           .setStyle(ButtonStyle.Secondary)
           .setDisabled(true);
      }
    } else {
      if (showRealPosition && isHiddenRoom) {
        // Hết lượt, lộ vị trí thực
        btn.setLabel(`Phòng ${i}`)
           .setEmoji('👻')
           .setStyle(ButtonStyle.Success)
           .setDisabled(true);
      } else {
        // Chưa mở
        btn.setLabel(`Phòng ${i}`)
           .setStyle(ButtonStyle.Primary)
           .setDisabled(showRealPosition || game.status !== 'PLAYING'); // disable hết nếu game over
      }
    }

    currentRow.addComponents(btn);
    if (i % 5 === 0) {
      rows.push(currentRow);
      currentRow = new ActionRowBuilder();
    }
  }

  return rows;
}

export function buildHiderUI() {
  const rows = [];
  let currentRow = new ActionRowBuilder();

  for (let i = 1; i <= 10; i++) {
    const btn = new ButtonBuilder()
      .setCustomId(`trontim_hide_${i}`)
      .setLabel(`Phòng ${i}`)
      .setStyle(ButtonStyle.Primary);

    currentRow.addComponents(btn);
    if (i % 5 === 0) {
      rows.push(currentRow);
      currentRow = new ActionRowBuilder();
    }
  }
  return rows;
}

