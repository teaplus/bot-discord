import { getGame, endGame } from "../utils/wordChainGame.js";

const PREFIX = "!";

// ─── Helper: thông báo kết thúc game ────────────────────────────────────────
async function announceEnd(channel, over) {
  let msg = "🏆 **Game kết thúc!**\n\n";

  if (over.reason === "three_locked") {
    msg += "Có 3 người bị khóa.\n\n";
  } else {
    msg += "Không còn từ phù hợp để nối.\n\n";
  }

  msg += over.winner
    ? `Người chiến thắng: <@${over.winner}>`
    : "Không có người chiến thắng.";

  await channel.send(msg);
}

// ─── Helper: xử lý câu trả lời game ─────────────────────────────────────────
async function handleGameAnswer(game, message) {
  const userId = message.author.id;
  const input = message.content.trim();
  const channel = message.channel;

  // Bỏ qua người bị lock
  if (game.isLocked(userId)) return;

  const result = game.processAnswer(userId, input);

  // ── Phân loại kết quả ─────────────────────────────────────────────────────
  switch (result.type) {
    // Sai format
    case "wrong_format":
      await message.react("❌");
      await message.reply("❌ Câu trả lời phải gồm đúng 2 tiếng.");
      if (result.justLocked) {
        await channel.send(
          `🔒 <@${userId}> đã sai ${result.wrongCount} lần liên tiếp và bị khóa ở từ **"${game.currentWord}"**.`
        );
        const over = game.checkGameOver();
        if (over) {
          await announceEnd(channel, over);
          endGame(game.guildId);
        }
      }
      return;

    // Sai tiếng đầu
    case "wrong_prefix":
      await message.react("❌");
      await message.reply(
        `⚠️ Từ hiện tại phải bắt đầu bằng **"${result.currentWord}"**.`
      );
      if (result.justLocked) {
        await channel.send(
          `🔒 <@${userId}> đã sai ${result.wrongCount} lần liên tiếp và bị khóa ở từ **"${game.currentWord}"**.`
        );
        const over = game.checkGameOver();
        if (over) {
          await announceEnd(channel, over);
          endGame(game.guildId);
        }
      }
      return;

    // Phrase đã dùng
    case "already_used":
      await message.react("❌");
      await message.reply("⚠️ Phrase này đã được sử dụng trong game.");
      if (result.justLocked) {
        await channel.send(
          `🔒 <@${userId}> đã sai ${result.wrongCount} lần liên tiếp và bị khóa ở từ **"${game.currentWord}"**.`
        );
        const over = game.checkGameOver();
        if (over) {
          await announceEnd(channel, over);
          endGame(game.guildId);
        }
      }
      return;

    // Không có trong từ điển
    case "not_in_dict":
      await message.react("❌");
      await message.reply(`⚠️ **"${result.phrase}"** không có trong từ điển.`);
      if (result.justLocked) {
        await channel.send(
          `🔒 <@${userId}> đã sai ${result.wrongCount} lần liên tiếp và bị khóa ở từ **"${game.currentWord}"**.`
        );
        const over = game.checkGameOver();
        if (over) {
          await announceEnd(channel, over);
          endGame(game.guildId);
        }
      }
      return;

    // ── Đúng! ────────────────────────────────────────────────────────────────
    case "correct": {
      await message.react("✅");

      // Kiểm tra game over do hết từ
      const overAfterPlayer = game.checkGameOver();
      if (overAfterPlayer) {
        await announceEnd(channel, overAfterPlayer);
        endGame(game.guildId);
        return;
      }

      // Bot mode: bot tự trả lời
      if (game.mode === "bot") {
        const botAnswer = game.getBotAnswer();

        if (!botAnswer) {
          // Bot hết nước → user vừa trả lời đúng thắng
          await channel.send(
            `🏆 <@${userId}> thắng!\n\nBot không còn từ để nối.`
          );
          endGame(game.guildId);
          return;
        }

        await channel.send(
          `🤖 **${botAnswer.phrase}**\n\nTừ tiếp theo: **${botAnswer.newCurrentWord}**`
        );

        // Kiểm tra game over sau lượt bot
        const overAfterBot = game.checkGameOver();
        if (overAfterBot) {
          await announceEnd(channel, overAfterBot);
          endGame(game.guildId);
        }
      } else {
        // Player mode: chỉ thông báo từ tiếp theo
        await channel.send(`Từ tiếp theo: **${result.newCurrentWord}**`);
      }
      return;
    }
  }
}

// ─── Event ───────────────────────────────────────────────────────────────────
export default {
  name: "messageCreate",
  once: false,

  async execute(message, client) {
    // Bỏ qua bot (tránh bot tự trigger)
    if (message.author.bot) return;

    const isPrefix = message.content.startsWith(PREFIX);

    // ── Non-prefix message trong guild: kiểm tra game ────────────────────────
    if (!isPrefix && message.guild) {
      const game = getGame(message.guild.id);
      if (game && !game.finished && game.channelId === message.channel.id) {
        await handleGameAnswer(game, message);
      }
      return; // Bỏ qua non-prefix ngoài game
    }

    // ── Prefix command handler ────────────────────────────────────────────────
    if (!isPrefix) return;

    const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
    const commandName = args.shift().toLowerCase();
    const command = client.prefixCommands.get(commandName);
    if (!command) return;

    try {
      await command.execute(message, args);
    } catch (error) {
      console.error(`❌ Lỗi khi chạy !${commandName}:`, error);
      await message.reply("⚠️ Có lỗi xảy ra khi thực hiện lệnh!");
    }
  },
};
