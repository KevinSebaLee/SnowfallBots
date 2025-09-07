/**
 * Command Registration Script
 * This script registers all the bot's commands with Discord
 */

import { REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to commands directory
const commandsPath = path.join(__dirname, 'src', 'commands');

// Command collection
const commands = [];

// Load all command files
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js') && !file.includes('_bak'));

for (const file of commandFiles) {
  const filePath = `file:///${path.join(commandsPath, file).replace(/\\/g, '/')}`;
  try {
    // Import the command module
    const command = await import(filePath);
    
    // Get the command data
    if (command.default && command.default.data) {
      commands.push(command.default.data.toJSON());
      console.log(`✅ Loaded command: ${command.default.data.name}`);
    } else if (file === 'leaderboard.js') {
      // Special handling for leaderboard command
      const data = {
        name: 'leaderboard',
        description: 'Muestra el ranking de XP del servidor',
        options: [
          {
            name: 'limit',
            description: 'Número de usuarios a mostrar (máximo 10)',
            type: 4, // INTEGER type
            required: false,
            min_value: 1,
            max_value: 10
          }
        ]
      };
      commands.push(data);
      console.log(`✅ Manually loaded command: leaderboard`);
    } else {
      console.log(`❌ Command at ${file} is missing a required "data" property`);
    }
  } catch (error) {
    console.error(`Error loading command ${file}:`, error);
  }
}

// Create and configure REST client
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

// Deploy commands
(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands...`);

    // Register commands globally
    const data = await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID || process.env.APP_ID),
      { body: commands },
    );

    console.log(`Successfully reloaded ${data.length} application (/) commands!`);
  } catch (error) {
    console.error('Error deploying commands:', error);
  }
})();
