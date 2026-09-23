import { Events } from "discord.js";

export default {
  name: Events.Debug,
  once: false,

  execute(info) {
    console.log(`[DEBUG] ${info}`);
  },
};
