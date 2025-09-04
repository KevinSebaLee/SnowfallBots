import { XP_CONFIG } from "../config/constants.js";

export class CooldownManager {
  constructor() {
    this.cooldowns = new Map();
  }

  checkXPCooldown(userId) {
    const now = Date.now();
    const lastXP = this.cooldowns.get(`xp:${userId}`) || 0;
    
    if (now - lastXP < XP_CONFIG.XP_COOLDOWN) {
      return false;
    }
    
    this.cooldowns.set(`xp:${userId}`, now);
    return true;
  }

  setCooldown(userId, action, duration) {
    const key = `${action}:${userId}`;
    this.cooldowns.set(key, Date.now() + duration);
  }

  isOnCooldown(userId, action) {
    const key = `${action}:${userId}`;
    const cooldownEnd = this.cooldowns.get(key) || 0;
    
    if (Date.now() >= cooldownEnd) {
      this.cooldowns.delete(key);
      return false;
    }
    
    return true;
  }

  getRemainingCooldown(userId, action) {
    const key = `${action}:${userId}`;
    const cooldownEnd = this.cooldowns.get(key) || 0;
    const remaining = cooldownEnd - Date.now();
    
    return Math.max(0, remaining);
  }

  /**
   * Clear all cooldowns for a user
   * @param {string} userId - Discord user ID
   */
  clearUserCooldowns(userId) {
    for (const [key] of this.cooldowns) {
      if (key.endsWith(`:${userId}`)) {
        this.cooldowns.delete(key);
      }
    }
  }

  /**
   * Clear expired cooldowns (cleanup method)
   */
  clearExpiredCooldowns() {
    const now = Date.now();
    
    for (const [key, expiry] of this.cooldowns) {
      if (now >= expiry) {
        this.cooldowns.delete(key);
      }
    }
  }

  /**
   * Get cooldown statistics
   * @returns {Object} Cooldown statistics
   */
  getStats() {
    return {
      totalCooldowns: this.cooldowns.size,
      activeCooldowns: Array.from(this.cooldowns.values()).filter(
        expiry => Date.now() < expiry
      ).length
    };
  }
}

// Export singleton instance
export const cooldownManager = new CooldownManager();

// Set up periodic cleanup
setInterval(() => {
  cooldownManager.clearExpiredCooldowns();
}, 5 * 60 * 1000); // Clean up every 5 minutes
