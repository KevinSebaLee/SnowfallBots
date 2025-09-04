/**
 * Interaction Create Event Handler
 * Handles slash command interactions
 */

// Simple test for now - we'll add commands back gradually
const handleInteractionCreate = async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // For now, just acknowledge commands
  try {
    await interaction.reply('Bot is starting up... Commands will be available soon!');
  } catch (error) {
    console.error('Error in interaction handler:', error);
  }
};

export default handleInteractionCreate;
