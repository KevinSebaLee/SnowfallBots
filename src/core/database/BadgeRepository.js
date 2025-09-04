/**
 * Badge Repository
 * Handles all badge-related database operations
 */

import supabase from '../../database/supabaseClient.js';
import { DATABASE_CONFIG } from '../../config/constants.js';

export class BadgeRepository {
  /**
   * Award a badge to a user
   * @param {string} userId - Discord user ID
   * @param {number} badgeId - Badge ID
   * @param {string} guildId - Discord guild ID
   * @param {string} username - User's username
   * @param {string} guildname - Guild's name
   * @returns {Promise<boolean>} Success status
   */
  async awardBadge(userId, badgeId, guildId, username, guildname) {
    if (!guildId) {
      console.warn('Cannot award badge without guild ID');
      return false;
    }

    try {
      const { error } = await supabase
        .from(DATABASE_CONFIG.TABLES.USER_BADGE)
        .upsert([{ 
          id_user: userId, 
          id_badge: badgeId, 
          id_guild: guildId, 
          username: username, 
          guild_name: guildname 
        }], {
          onConflict: ["id_user", "id_badge", "id_guild"],
        });

      if (error) {
        console.error(`Failed to award badge ${badgeId} to user ${userId}:`, error);
        return false;
      }

      console.log(`Badge ${badgeId} awarded to user ${userId} in guild ${guildId}`);
      return true;
    } catch (error) {
      console.error('Database error in awardBadge:', error);
      return false;
    }
  }

  /**
   * Get all badges for a user
   * @param {string} userId - Discord user ID
   * @param {string} guildId - Discord guild ID (optional)
   * @returns {Promise<Array>} Array of user badges
   */
  async getUserBadges(userId, guildId = null) {
    try {
      let query = supabase
        .from(DATABASE_CONFIG.TABLES.USER_BADGE)
        .select("*")
        .eq("id_user", userId);

      if (guildId) {
        query = query.eq("id_guild", guildId);
      }

      const { data, error } = await query;

      if (error) {
        console.error(`Failed to get badges for user ${userId}:`, error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Database error in getUserBadges:', error);
      return [];
    }
  }

  /**
   * Remove a badge from a user
   * @param {string} userId - Discord user ID
   * @param {number} badgeId - Badge ID
   * @param {string} guildId - Discord guild ID
   * @returns {Promise<boolean>} Success status
   */
  async removeBadge(userId, badgeId, guildId) {
    try {
      const { error } = await supabase
        .from(DATABASE_CONFIG.TABLES.USER_BADGE)
        .delete()
        .eq("id_user", userId)
        .eq("id_badge", badgeId)
        .eq("id_guild", guildId);

      if (error) {
        console.error(`Failed to remove badge ${badgeId} from user ${userId}:`, error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Database error in removeBadge:', error);
      return false;
    }
  }

  /**
   * Get all badges in a guild
   * @param {string} guildId - Discord guild ID
   * @returns {Promise<Array>} Array of guild badges
   */
  async getGuildBadges(guildId) {
    try {
      const { data, error } = await supabase
        .from(DATABASE_CONFIG.TABLES.USER_BADGE)
        .select("*")
        .eq("id_guild", guildId);

      if (error) {
        console.error(`Failed to get badges for guild ${guildId}:`, error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Database error in getGuildBadges:', error);
      return [];
    }
  }
}

// Export singleton instance
export const badgeRepository = new BadgeRepository();
