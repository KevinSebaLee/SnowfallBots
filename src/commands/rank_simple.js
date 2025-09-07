import { SlashCommandBuilder } from 'discord.js';
import { xpService } from '../core/xp/XPService.js';
import { createXPWidget } from '../ui/index.js';
import { userRepository } from '../core/database/UserRepository.js';

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
      await interaction.editReply(`${targetUser.username} no tiene XP registrado aún en este servidor.`);
      return;
    }
    
    // Get user's rank position
    const rank = await userRepository.getUserRank(interaction.guildId, userData.level, userData.xp);
    
    // Prepare user object for the widget
    const userForWidget = {
      id: targetUser.id,
      username: targetUser.username,
      discriminator: targetUser.discriminator || '0000',
      displayAvatarURL: () => targetUser.displayAvatarURL({ extension: 'png', size: 256 })
    };
    
    // Create XP widget image
    try {
      const widget = await createXPWidget(
        userForWidget,
        {
          global_level: userData.level,
          global_xp: userData.xp
        },
        rank,
        interaction.guildId
      );
      
      // Send the generated image
      await interaction.editReply({ files: [widget] });
    } catch (widgetError) {
      console.error('Error creating XP widget:', widgetError);
      
      // Fallback to text if widget creation fails
      const content = `**${targetUser.username}**\n` +
                     `🎯 Nivel: **${userData.level}**\n` +
                     `⭐ XP: **${userData.xp}**\n` +
                     `📊 Servidor: **${interaction.guild.name}**\n` +
                     `🏆 Posición: **${rank || 'N/A'}**`;
      
      await interaction.editReply(content);
    }
  } catch (error) {
    console.error('Error in rank command:', error);
    
    // Fallback to text if image generation fails
    try {
      const targetUser = interaction.options.getUser('usuario') || interaction.user;
      const userData = await xpService.getUserXP(targetUser.id, interaction.guildId);
      
      if (userData) {
        const fallbackContent = `**${targetUser.username}**\n` +
                               `🎯 Nivel: **${userData.level || 'N/A'}**\n` +
                               `⭐ XP: **${userData.xp || 'N/A'}**\n` +
                               `📊 Servidor: **${interaction.guild.name}**`;
        
        if (interaction.deferred) {
          await interaction.editReply({ content: fallbackContent });
        } else {
          await interaction.reply({ content: fallbackContent, flags: 64 });
        }
      } else {
        const errorMessage = 'Error al obtener la información de rango.';
        if (interaction.deferred) {
          await interaction.editReply({ content: errorMessage });
        } else {
          await interaction.reply({ content: errorMessage, flags: 64 });
        }
      }
    } catch (fallbackError) {
      console.error('Error in fallback:', fallbackError);
      const errorMessage = 'Error al obtener la información de rango.';
      if (interaction.deferred) {
        await interaction.editReply({ content: errorMessage });
      } else {
        await interaction.reply({ content: errorMessage, flags: 64 });
      }
    }
  }
};

export default { data, execute };