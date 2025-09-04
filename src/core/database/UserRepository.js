/**
 * Database abstraction layer for user operations
 * Provides a clean interface for all user-related database operations
 */

import supabase from '../../database/supabaseClient.js';
import { DATABASE_CONFIG } from '../../config/constants.js';

export class UserRepository {
  /**
   * Get user XP data by user ID
   * @param {string} userId - Discord user ID
   * @returns {Promise<Object|null>} User XP data or null if not found
   */
  async getUserXP(userId) {
    try {
      const { data, error } = await supabase
        .from(DATABASE_CONFIG.TABLES.USERS)
        .select('global_xp, global_level')
        .eq('id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching user XP:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Database error in getUserXP:', error);
      return null;
    }
  }

  /**
   * Create a new user with initial XP and level
   * @param {string} userId - Discord user ID
   * @param {number} initialXP - Starting XP amount
   * @param {number} initialLevel - Starting level
   * @returns {Promise<boolean>} Success status
   */
  async createUser(userId, initialXP = 0, initialLevel = 1) {
    try {
      const { error } = await supabase
        .from(DATABASE_CONFIG.TABLES.USERS)
        .insert({ 
          id: userId, 
          global_xp: initialXP, 
          global_level: initialLevel 
        });

      if (error) {
        console.error('Error creating user:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Database error in createUser:', error);
      return false;
    }
  }

  /**
   * Update user XP and potentially level
   * @param {string} userId - Discord user ID
   * @param {number} newXP - New XP amount
   * @param {number} newLevel - New level (optional)
   * @returns {Promise<boolean>} Success status
   */
  async updateUserXP(userId, newXP, newLevel = null) {
    try {
      const updateData = { global_xp: newXP };
      if (newLevel !== null) {
        updateData.global_level = newLevel;
      }

      const { error } = await supabase
        .from(DATABASE_CONFIG.TABLES.USERS)
        .update(updateData)
        .eq('id', userId);

      if (error) {
        console.error('Error updating user XP:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Database error in updateUserXP:', error);
      return false;
    }
  }

  /**
   * Get user rank position based on level and XP
   * @param {number} level - User's level
   * @param {number} xp - User's XP
   * @returns {Promise<number>} Rank position (1-based)
   */
  async getUserRank(level, xp) {
    try {
      const { data: users } = await supabase
        .from(DATABASE_CONFIG.TABLES.USERS)
        .select('global_level, global_xp')
        .order('global_level', { ascending: false })
        .order('global_xp', { ascending: false });

      if (!users) return 1;

      const position = users.findIndex(u => u.global_level === level && u.global_xp === xp);
      return position === -1 ? users.length + 1 : position + 1;
    } catch (error) {
      console.error('Database error in getUserRank:', error);
      return 1;
    }
  }

  /**
   * Get leaderboard data for a guild
   * @param {string} guildId - Discord guild ID
   * @param {number} limit - Number of users to fetch
   * @returns {Promise<Array>} Array of user data
   */
  async getLeaderboard(guildId, limit = DATABASE_CONFIG.LEADERBOARD_LIMIT) {
    try {
      const { data: leaderboard, error } = await supabase
        .from(DATABASE_CONFIG.TABLES.USER_GUILD)
        .select('users(id, username, avatar, global_xp, global_level)')
        .order('users(global_level)', { ascending: false })
        .order('users(global_xp)', { ascending: false })
        .eq('guild_id', guildId)
        .limit(limit);

      if (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
      }

      return leaderboard || [];
    } catch (error) {
      console.error('Database error in getLeaderboard:', error);
      return [];
    }
  }

  /**
   * Reset user level and XP
   * @param {string} userId - Discord user ID
   * @returns {Promise<boolean>} Success status
   */
  async resetUser(userId) {
    return this.updateUserXP(userId, 0, 1);
  }

  /**
   * Set specific XP and level for a user
   * @param {string} userId - Discord user ID
   * @param {number} xp - XP to set
   * @param {number} level - Level to set
   * @returns {Promise<boolean>} Success status
   */
  async setUserXPLevel(userId, xp, level) {
    return this.updateUserXP(userId, xp, level);
  }
}

// Export singleton instance
export const userRepository = new UserRepository();
