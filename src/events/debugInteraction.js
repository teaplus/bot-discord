import { Events } from "discord.js";

export default {
  name: Events.InteractionCreate,
  once: false,

  execute(interaction) {
    console.log(
      `[DEBUG EVENT] Đã nhận một interaction: ${interaction.type} từ user ${interaction.user.tag}`
    );
    if (interaction.isChatInputCommand()) {
      console.log(`[DEBUG EVENT] Command Name: /${interaction.commandName}`);
    }
  },
};
