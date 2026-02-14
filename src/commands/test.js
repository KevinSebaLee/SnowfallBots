// Simple test command
import pkg from 'discord.js';
const { SlashCommandBuilder } = pkg;

const data = new SlashCommandBuilder()
  .setName('test')
  .setDescription('Simple test command');

const execute = async (interaction) => {
  await interaction.reply('Test command works!');
};

const testCommand = { data, execute };
export default testCommand;
