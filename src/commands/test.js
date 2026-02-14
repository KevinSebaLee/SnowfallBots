// Simple test command
import { SlashCommandBuilder } from 'discord.js';

const data = new SlashCommandBuilder()
  .setName('test')
  .setDescription('Simple test command');

const execute = async (interaction) => {
  await interaction.reply('Test command works!');
};

const testCommand = { data, execute };
export default testCommand;
