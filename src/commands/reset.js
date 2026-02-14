/**
 * Reset Level Command
 * Resets a user's level and XP back to starting values
 */

import { SlashCommandBuilder } from 'discord.js';
import { xpService } from '../core/xp/XPService.js';

const data = new SlashCommandBuilder()
  .setName('resetlevel')
  .setDescription('Reinicia el nivel de un usuario a 0')
  .addUserOption(option =>
    option.setName('target')
      .setDescription('El nombre del usuario cuyo nivel se reiniciará')
      .setRequired(true)
  );

const execute = async (interaction) => {
  // Check if user has admin permissions
  if (!interaction.member.permissions.has('Administrator')) {
    await interaction.reply({
      content: 'No tienes permisos para usar este comando.',
      ephemeral: true
    });
    return;
  }

  const targetUser = interaction.options.getUser('target');
  
  try {
    const success = await xpService.resetUserXP(targetUser.id);
    
    if (success) {
      await interaction.reply({
        content: `Nivel de ${targetUser.tag} reiniciado exitosamente.`,
        ephemeral: true
      });
    } else {
      await interaction.reply({
        content: 'Hubo un error al reiniciar el nivel.',
        ephemeral: true
      });
    }
  } catch (error) {
    console.error('Error in reset command:', error);
    await interaction.reply({
      content: 'Ocurrió un error al reiniciar el nivel.',
      ephemeral: true
    });
  }
};

const resetCommand = { data, execute };
export default resetCommand;
