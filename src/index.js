import 'dotenv/config';
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => {
  res.send('Bot Discord Nối Từ đang chạy 24/7!');
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
    GatewayIntentBits.MessageContent, // cần cho prefix commands
  ],
});

// ─── Load Slash Commands ──────────────────────────────────────────────────────
client.slashCommands = new Collection();

const commandsPath = join(__dirname, 'commands');
const commandFolders = readdirSync(commandsPath);

for (const folder of commandFolders) {
  const folderPath = join(commandsPath, folder);
  const commandFiles = readdirSync(folderPath).filter(f => f.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = join(folderPath, file);
    const { default: command } = await import(`file://${filePath}`);

    if ('data' in command && 'execute' in command) {
      client.slashCommands.set(command.data.name, command);
      console.log(`  ✅ Slash loaded: /${command.data.name}`);
    } else {
      console.warn(`  ⚠️  Bỏ qua ${file} – thiếu "data" hoặc "execute"`);
    }
  }
}

// ─── Load Prefix Commands ─────────────────────────────────────────────────────
client.prefixCommands = new Collection();

const prefixPath = join(__dirname, 'prefix');
const prefixFiles = readdirSync(prefixPath).filter(f => f.endsWith('.js'));

for (const file of prefixFiles) {
  const filePath = join(prefixPath, file);
  const { default: command } = await import(`file://${filePath}`);

  if ('name' in command && 'execute' in command) {
    client.prefixCommands.set(command.name, command);
    console.log(`  ✅ Prefix loaded: !${command.name}`);
  }
}

// ─── Load Events ─────────────────────────────────────────────────────────────
const eventsPath = join(__dirname, 'events');
const eventFiles = readdirSync(eventsPath).filter(f => f.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = join(eventsPath, file);
  const { default: event } = await import(`file://${filePath}`);

  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
  console.log(`  📡 Event loaded: ${event.name}`);
}

// ─── Đăng nhập ───────────────────────────────────────────────────────────────
client.login(process.env.DISCORD_TOKEN);

