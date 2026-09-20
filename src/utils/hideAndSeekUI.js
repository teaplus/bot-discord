import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";

export function buildDoorsUI(game, showRealPosition = false) {
  const rows = [];

  for (let y = 0; y < 5; y++) {
    let currentRow = new ActionRowBuilder();
    for (let x = 0; x < 5; x++) {
      const btn = new ButtonBuilder().setCustomId(`trontim_room_${x}_${y}`);

      const isGuessed = game.guessedRooms.some((r) => r.x === x && r.y === y);
      const isHiddenRoom =
        game.hiddenRoom && game.hiddenRoom.x === x && game.hiddenRoom.y === y;

      if (isGuessed) {
        if (isHiddenRoom) {
          btn.setEmoji("👻").setStyle(ButtonStyle.Success).setDisabled(true);
        } else {
          btn.setEmoji("💨").setStyle(ButtonStyle.Secondary).setDisabled(true);
        }
      } else {
        if (showRealPosition && isHiddenRoom) {
          // Hết lượt, lộ vị trí thực
          btn.setEmoji("👻").setStyle(ButtonStyle.Success).setDisabled(true);
        } else {
          // Chưa mở
          btn
            .setEmoji("🚪")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(showRealPosition || game.status !== "PLAYING"); // disable hết nếu game over
        }
      }
      currentRow.addComponents(btn);
    }
    rows.push(currentRow);
  }

  return rows;
}

export function buildHiderUI() {
  const rows = [];

  for (let y = 0; y < 5; y++) {
    let currentRow = new ActionRowBuilder();
    for (let x = 0; x < 5; x++) {
      const btn = new ButtonBuilder()
        .setCustomId(`trontim_hide_${x}_${y}`)
        .setEmoji("🚪")
        .setStyle(ButtonStyle.Primary);
      currentRow.addComponents(btn);
    }
    rows.push(currentRow);
  }
  return rows;
}
