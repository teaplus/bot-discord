import { Events } from "discord.js";

export default {
  name: Events.MessageCreate,
  once: false,

  execute(message) {
    if (!message.author.bot) {
      console.log(
        `[DEBUG EVENT] Đã nhận tin nhắn từ ${message.author.tag}: ${message.content}`
      );
    }
  },
};
