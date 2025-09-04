/**
 * XP calculation utilities
 * Contains all mathematical functions related to XP and leveling
 */

import { XP_CONFIG } from '../../config/constants.js';

export class XPCalculator {
  static calculateXPForLevel(level) {
    return Math.floor(XP_CONFIG.BASE_EXP * Math.pow(XP_CONFIG.GROWTH_RATE, level - 1));
  }

  static calculateTotalXPForLevel(level) {
    return Math.floor(
      XP_CONFIG.BASE_EXP * 
      ((Math.pow(XP_CONFIG.GROWTH_RATE, level) - 1) / (XP_CONFIG.GROWTH_RATE - 1))
    );
  }

  static calculateLevelFromXP(totalXP) {
    if (totalXP <= 0) return 1;
    
    // Use logarithmic calculation to find level
    const level = Math.floor(
      Math.log((totalXP * (XP_CONFIG.GROWTH_RATE - 1)) / XP_CONFIG.BASE_EXP + 1) / 
      Math.log(XP_CONFIG.GROWTH_RATE)
    ) + 1;
    
    return Math.max(1, level);
  }

  /**
   * Calculate XP progress for current level (0-1)
   * @param {number} currentXP - User's current XP
   * @param {number} currentLevel - User's current level
   * @returns {Object} Progress information
   */
  static calculateLevelProgress(currentXP, currentLevel) {
    const currentLevelXP = this.calculateTotalXPForLevel(currentLevel - 1);
    const nextLevelXP = this.calculateTotalXPForLevel(currentLevel);
    const progressXP = currentXP - currentLevelXP;
    const neededXP = nextLevelXP - currentLevelXP;
    
    return {
      progressXP: Math.max(0, progressXP),
      neededXP,
      totalNeededXP: nextLevelXP,
      progressPercent: Math.min(1, Math.max(0, progressXP / neededXP))
    };
  }

  static checkLevelUp(currentXP, currentLevel) {
    const newLevel = this.calculateLevelFromXP(currentXP);
    const shouldLevelUp = newLevel > currentLevel;
    
    return {
      shouldLevelUp,
      newLevel,
      levelsGained: shouldLevelUp ? newLevel - currentLevel : 0
    };
  }

  static generateXPGain(multiplier = XP_CONFIG.DEFAULT_MULTIPLIER) {
    const randomXP = Math.floor(
      Math.random() * (XP_CONFIG.MAX_XP_GAIN - XP_CONFIG.MIN_XP_GAIN + 1) + 
      XP_CONFIG.MIN_XP_GAIN
    );
    
    return Math.floor(randomXP * multiplier);
  }

  static generateBonusXP() {
    return Math.floor(
      Math.random() * 
      (XP_CONFIG.QUICK_EVENT_MAX_BONUS - XP_CONFIG.QUICK_EVENT_MIN_BONUS + 1) + 
      XP_CONFIG.QUICK_EVENT_MIN_BONUS
    );
  }
}
