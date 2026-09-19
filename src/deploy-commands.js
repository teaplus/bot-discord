import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const commands = [];
const commandsPath = join(__dirname, 'commands');
const commandFolders = readdirSync(commandsPath);

for (const folder of commandFolders) {
  const folderPath = join(commandsPath, folder);
  const commandFiles = readdirSync(folderPath).filter(f => f.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = join(folderPath, file);
    const { default: command } = await import(`file://${filePath}`);
    if ('data' in command) {
      commands.push(command.data.toJSON());
    }
  }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// Đổi thành Routes.applicationCommands(CLIENT_ID) nếu muốn global
const route = Routes.applicationGuildCommands(
  process.env.CLIENT_ID,
  process.env.GUILD_ID
);

try {
  console.log(`🔄 Đang đăng ký ${commands.length} slash command(s)...`);
  const data = await rest.put(route, { body: commands });
  console.log(`✅ Đã đăng ký thành công ${data.length} slash command(s).`);
} catch (error) {
  console.error('❌ Lỗi khi deploy commands:', error);
}

