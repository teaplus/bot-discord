import "dotenv/config";
import { Client, Collection, GatewayIntentBits } from "discord.js";
import { readdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Bot Discord Nối Từ đang chạy 24/7!");
});

app.listen(PORT, () => {
  console.log(`🌐 Keep-alive server đang chạy tại port ${PORT}`);
});

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Khởi tạo client ─────────────────────────────────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// ─── Load Slash Commands ──────────────────────────────────────────────────────
client.slashCommands = new Collection();
const commandsPath = join(__dirname, "commands");

if (existsSync(commandsPath)) {
  const commandFolders = readdirSync(commandsPath);
  for (const folder of commandFolders) {
    const folderPath = join(commandsPath, folder);
    const commandFiles = readdirSync(folderPath).filter((f) => f.endsWith(".js"));

    for (const file of commandFiles) {
      try {
        const filePath = join(folderPath, file);
        const fileUrl = pathToFileURL(filePath).href; // Tối ưu đường dẫn fileURL cho Linux/Render
        const { default: command } = await import(fileUrl);

        if (command && "data" in command && "execute" in command) {
          client.slashCommands.set(command.data.name, command);
          console.log(`  ✅ Slash loaded: /${command.data.name}`);
        } else {
          console.warn(`  ⚠️  Bỏ qua ${file} – thiếu "data" hoặc "execute"`);
        }
      } catch (err) {
        console.error(`  ❌ Lỗi khi nạp Slash Command (${file}):`, err.message);
      }
    }
  }
} else {
  console.warn("  ⚠️ Không tìm thấy thư mục 'commands'");
}

// ─── Load Prefix Commands ─────────────────────────────────────────────────────
client.prefixCommands = new Collection();
const prefixPath = join(__dirname, "prefix");

if (existsSync(prefixPath)) {
  const prefixFiles = readdirSync(prefixPath).filter((f) => f.endsWith(".js"));
  for (const file of prefixFiles) {
    try {
      const filePath = join(prefixPath, file);
      const fileUrl = pathToFileURL(filePath).href;
      const { default: command } = await import(fileUrl);

      if (command && "name" in command && "execute" in command) {
        client.prefixCommands.set(command.name, command);
        console.log(`  ✅ Prefix loaded: !${command.name}`);
      }
    } catch (err) {
      console.error(`  ❌ Lỗi khi nạp Prefix Command (${file}):`, err.message);
    }
  }
} else {
  console.warn("  ⚠️ Không tìm thấy thư mục 'prefix'");
}

// ─── Load Events ─────────────────────────────────────────────────────────────
const eventsPath = join(__dirname, "events");

if (existsSync(eventsPath)) {
  const eventFiles = readdirSync(eventsPath).filter((f) => f.endsWith(".js"));
  for (const file of eventFiles) {
    try {
      const filePath = join(eventsPath, file);
      const fileUrl = pathToFileURL(filePath).href;
      const { default: event } = await import(fileUrl);

      if (event && event.name && event.execute) {
        if (event.once) {
          client.once(event.name, (...args) => event.execute(...args, client));
        } else {
          client.on(event.name, (...args) => event.execute(...args, client));
        }
        console.log(`  📡 Event loaded: ${event.name}`);
      }
    } catch (err) {
      console.error(`  ❌ Lỗi khi nạp Event (${file}):`, err.message);
    }
  }
} else {
  console.warn("  ⚠️ Không tìm thấy thư mục 'events'");
}

// ─── Đăng nhập & Bắt lỗi ─────────────────────────────────────────────────────
if (!process.env.DISCORD_TOKEN) {
  console.error("❌ ERROR: Chưa khai báo biến DISCORD_TOKEN trong Environment!");
} else {
  console.log("✅ Đã tìm thấy DISCORD_TOKEN. Độ dài:", process.env.DISCORD_TOKEN.length);
}

console.log("🔄 Đang tiến hành kết nối tới Discord...");

client.login(process.env.DISCORD_TOKEN).catch((err) => {
  console.error("❌ Kết nối Discord thất bại:", err.message);
});