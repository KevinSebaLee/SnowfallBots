/**
 * Leaderboard Command
 * Shows top users by XP/level with visual widget
 */

import { SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import { xpService } from '../core/xp/XPService.js';
import { XP_CONFIG } from '../config/constants.js';
import drawLeaderboard from '../ui/leaderboardWidget.js';

// Create the command data
const data = new SlashCommandBuilder()
  .setName('leaderboard')
  .setDescription('Muestra el ranking de XP del servidor')
  .addIntegerOption(option =>
    option.setName('limit')
      .setDescription('Número de usuarios a mostrar (máximo 10)')
      .setMinValue(1)
      .setMaxValue(10)
      .setRequired(false)
  );

// Command execution function
const execute = async (interaction) => {
  try {
    await interaction.deferReply();
    
    const leaderboardData = await xpService.getLeaderboard(interaction.guildId, XP_CONFIG.LEADERBOARD_LIMIT || 10);
    
    if (!leaderboardData || leaderboardData.length === 0) {
      await interaction.editReply('No hay datos de XP disponibles para este servidor.');
      return;
    }
    
    try {
      // Format user data for the leaderboard widget
      const formattedUsers = await Promise.all(leaderboardData.map(async (users) => {
        try {
          // Fetch Discord user to get the avatar URL
          const discordUser = await interaction.client.users.fetch(users.user_id).catch(() => null);

          return {
            id: users.id,
            name: discordUser?.username || `Usuario #${users.id}`,
            avatarUrl: discordUser?.displayAvatarURL({ extension: 'png', size: 128 }),
            level: users.level,
            xp: users.xp,
          };
        } catch (error) {
          console.error(`Error fetching user ${users.id}:`, error);
          return {
            id: users.id,
            name: `Usuario #${users.id}`,
            level: users.level,
            xp: users.xp,
          };
        }
      }));
      
      // Generate the leaderboard image
      const { buffer, filename } = await drawLeaderboard(formattedUsers);
      
      // Send the image
      await interaction.editReply({
        content: `🏆 **Ranking de XP de ${interaction.guild.name}** 🏆`,
        files: [new AttachmentBuilder(buffer, { name: filename })]
      });
    } catch (imageError) {
      console.error('Error generating leaderboard image:', imageError);
      
      // Fallback to text-based leaderboard
      let content = '🏆 **Ranking de XP** 🏆\n\n';
      
      leaderboardData.forEach((user, index) => {
        const position = index + 1;
        const emoji = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : '▫️';
        content += `${emoji} **${position}.** <@${user.id}> - Nivel ${user.level} (${user.xp} XP)\n`;
      });
      
      await interaction.editReply(content);
    }
    
  } catch (error) {
    console.error('Error in leaderboard command:', error);
    
    const errorMessage = 'Error al generar el ranking.';
    if (interaction.deferred) {
      await interaction.editReply({ content: errorMessage });
    } else {
      await interaction.reply({ content: errorMessage, ephemeral: true });
    }
  }
};

// Export the command object - use named export to avoid default export issues
export { data, execute };
