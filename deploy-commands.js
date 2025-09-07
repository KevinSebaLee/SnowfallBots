/**
 * Command Deployment Script
 * Registers all slash commands with Discord
 */

import { REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Discord REST API client
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

// Get the directory where this script is located
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to commands directory
const commandsPath = path.join(__dirname, 'src', 'commands');

async function deployCommands() {
  const commands = [];
  const commandFiles = fs.readdirSync(commandsPath).filter(file => 
    file.endsWith('.js') && !file.includes('_old') && !file.includes('_backup')
  );

  console.log(`Loading ${commandFiles.length} command files...`);

  // Import all command files
  for (const file of commandFiles) {
    try {
      const filePath = `file://${path.join(commandsPath, file).replace(/\\/g, '/')}`;
      const command = await import(filePath);
      
      // Add command data to the array
      if ('data' in command.default) {
        commands.push(command.default.data.toJSON());
        console.log(`✅ Loaded command: ${command.default.data.name}`);
      } else {
        console.log(`❌ Command at ${file} is missing a required "data" property.`);
      }
    } catch (error) {
      console.error(`Error loading command ${file}:`, error);
    }
  }

  try {
    console.log(`Started refreshing ${commands.length} application (/) commands...`);

    // Register global commands with Discord
    const data = await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands },
    );

    console.log(`Successfully reloaded ${data.length} application (/) commands!`);
  } catch (error) {
    console.error('Error deploying commands:', error);
  }
}

deployCommands();
