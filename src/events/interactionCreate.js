/**
 * Interaction Create Event Handler
 * Handles slash command interactions
 */

// Import commands directly
import ball8Command from '../commands/8ball_simple.js';
import rankCommand from '../commands/rank_simple.js';
// Import leaderboard using named imports
import * as leaderboardCommand from '../commands/leaderboard.js';
import shipCommand from '../commands/ship.js';

const commands = {
  '8ball': ball8Command,
  'rank': rankCommand,
  'leaderboard': leaderboardCommand,
  'ship': shipCommand,
};

export default function registerInteractionCreate(client) {
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = commands[interaction.commandName];
    
    if (!command) {
      console.log(`No command matching ${interaction.commandName} was found.`);
      await interaction.reply({ 
        content: `Command \`${interaction.commandName}\` not implemented yet.`, 
        flags: 64 // Use flags instead of ephemeral
      });
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`Error executing ${interaction.commandName}:`, error);
      
      const errorMessage = 'There was an error while executing this command!';
      
      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: errorMessage, flags: 64 });
        } else {
          await interaction.reply({ content: errorMessage, flags: 64 });
        }
      } catch (followUpError) {
        console.error('Error sending error message:', followUpError);
      }
    }
  });
}
