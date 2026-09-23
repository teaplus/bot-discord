import { Events } from "discord.js";

export default {
  name: Events.ClientReady,
  once: true,

  execute(client) {
    console.log(`\n🤖 Bot đã online: ${client.user.tag}`);
    console.log(`📡 Phục vụ ${client.guilds.cache.size} server(s)\n`);
    client.user.setActivity("Kinh Dịch 🔮", { type: 0 }); // 0 = Playing
  },
};
