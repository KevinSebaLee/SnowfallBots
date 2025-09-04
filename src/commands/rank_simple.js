/**
 * Rank Command - Simple Version
 * Shows user's current XP and level
 */

import { SlashCommandBuilder } from 'discord.js';
import { xpService } from '../core/xp/XPService.js';

const data = new SlashCommandBuilder()
  .setName('rank')
  .setDescription('Muestra tu nivel y XP actual')
  .addUserOption(option =>
    option.setName('usuario')
      .setDescription('Usuario del que ver el rango')
      .setRequired(false)
  );

const execute = async (interaction) => {
  try {
    await interaction.deferReply();
    
    const targetUser = interaction.options.getUser('usuario') || interaction.user;
    const userData = await xpService.getUserXP(targetUser.id, interaction.guildId);
    
    if (!userData) {
      await interaction.editReply(`${targetUser.username} no tiene XP registrado aún.`);
      return;
    }
    
    // Create text-based rank display
    const content = `**${targetUser.username}**\n` +
                   `🎯 Nivel: **${userData.level}**\n` +
                   `⭐ XP: **${userData.xp}**\n` +
                   `📈 XP para siguiente nivel: **${userData.xpForNext || 'N/A'}**`;
    
    await interaction.editReply(content);
    
  } catch (error) {
    console.error('Error in rank command:', error);
    
    const errorMessage = 'Error al obtener la información de rango.';
    if (interaction.deferred) {
      await interaction.editReply({ content: errorMessage });
    } else {
      await interaction.reply({ content: errorMessage, flags: 64 }); // 64 = ephemeral flag
    }
  }
};

export default { data, execute };
