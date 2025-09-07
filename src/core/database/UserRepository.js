/**
 * Database abstraction layer for user operations
 * Provides a clean interface for all user-related database operations
 */

import supabase from '../../database/supabaseClient.js';
import { DATABASE_CONFIG } from '../../config/constants.js';

export class UserRepository {
  async getUserXP(userId, guildId) {
    try {
      const { data, error } = await supabase
        .from(DATABASE_CONFIG.TABLES.USER_GUILD)
        .select('xp, level')
        .eq('user_id', userId)
        .eq('guild_id', guildId)
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

  async createUser(userId) {
    try {
      const { error } = await supabase
        .from(DATABASE_CONFIG.TABLES.USERS)
        .insert({ 
          id: userId
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

  async updateUserXP(userId, guildId, newXP, newLevel = null) {
    try {
      const updateData = { xp: newXP };
      if (newLevel !== null) {
        updateData.level = newLevel;
      }

      const { error } = await supabase
        .from(DATABASE_CONFIG.TABLES.USER_GUILD)
        .update(updateData)
        .eq('user_id', userId)
        .eq('guild_id', guildId);

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

  async getUserRank(guildId, level, xp) {
    try {
      const { data: users } = await supabase
        .from(DATABASE_CONFIG.TABLES.USER_GUILD)
        .select('level, xp')
        .eq('guild_id', guildId)
        .order('level', { ascending: false })
        .order('xp', { ascending: false });

      if (!users) return 1;

      const position = users.findIndex(u => u.level === level && u.xp === xp);
      return position === -1 ? users.length + 1 : position + 1;
    } catch (error) {
      console.error('Database error in getUserRank:', error);
      return 1;
    }
  }

  async getLeaderboard(guildId, limit) {
    try {
      const { data: leaderboard, error } = await supabase
        .from(DATABASE_CONFIG.TABLES.USER_GUILD)
        .select(`
          user_id,
          xp,
          level,
          users (
            id,
            username,
            avatar
          )
        `)
        .eq('guild_id', guildId)
        .order('level', { ascending: false })
        .order('xp', { ascending: false })
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

  async resetUser(userId, guildId) {
    return this.updateUserXP(userId, guildId, 0, 1);
  }

  async setUserXPLevel(userId, guildId, xp, level) {
    return this.updateUserXP(userId, guildId, xp, level);
  }

  async createUserGuild(userId, guildId, xp = 0, level = 1) {
    try {
      const { error } = await supabase
        .from(DATABASE_CONFIG.TABLES.USER_GUILD)
        .upsert({ 
          user_id: userId,
          guild_id: guildId,
          xp: xp,
          level: level
        });

      if (error) {
        console.error('Error creating user guild entry:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Database error in createUserGuild:', error);
      return false;
    }
  }
}

// Export singleton instance
export const userRepository = new UserRepository();
