import "dotenv/config";
import { REST, Routes } from "discord.js";

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

async function resetCommands() {
  const clientId = process.env.CLIENT_ID;
  const guildId = process.env.GUILD_ID;

  try {
    console.log("🔄 Đang xóa tất cả GUILD commands...");
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: [],
    });
    console.log("✅ Đã xóa toàn bộ lệnh trong Guild!");

    console.log("🔄 Đang xóa tất cả GLOBAL commands...");
    await rest.put(Routes.applicationCommands(clientId), { body: [] });
    console.log("✅ Đã xóa toàn bộ lệnh Global!");
  } catch (error) {
    console.error("❌ Lỗi:", error);
  }
}

resetCommands();
