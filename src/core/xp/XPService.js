/**
 * Main XP Service
 * Orchestrates all XP-related operations and provides a clean interface for other modules
 */

import pkg from 'discord.js';
const { EmbedBuilder } = pkg;
import { userRepository } from '../database/UserRepository.js';
import { XPCalculator } from './XPCalculator.js';
import { xpEventManager } from './XPEventManager.js';
import { cooldownManager } from '../../lib/CooldownManager.js';
import { XP_CONFIG, COLORS } from '../../config/constants.js';

export class XPService {
    async processMessageXP(message) {
        if (message.author.bot || !cooldownManager.checkXPCooldown(message.author.id)) {
            return null;
        }

        // Handle special events
        await xpEventManager.maybeActivateGlobalMultiplier(message);
        await xpEventManager.maybeActivateQuickXPEvent(message);

        const baseXP = XPCalculator.generateXPGain(xpEventManager.getMultiplier());

        // Get or create user data for this guild
        let userData = await userRepository.getUserXP(message.author.id, message.guild.id);

        if (!userData) {
            // New user in this guild - create entry with initial XP
            await userRepository.createUserGuild(message.author.id, message.guild.id, baseXP, 1);
            return {
                isLevelUp: false,
                newLevel: 1,
                xpGained: baseXP
            };
        }

        // Update existing user
        const newXP = userData.xp + baseXP;
        const levelUpInfo = XPCalculator.checkLevelUp(newXP, userData.level);

        await userRepository.updateUserXP(
            message.author.id,
            message.guild.id,
            newXP,
            levelUpInfo.shouldLevelUp ? levelUpInfo.newLevel : userData.level
        );

        // if (levelUpInfo.shouldLevelUp) {
        //     await this.sendLevelUpMessage(message, levelUpInfo.newLevel);
        // }

        return {
            isLevelUp: levelUpInfo.shouldLevelUp,
            newLevel: levelUpInfo.newLevel,
            levelsGained: levelUpInfo.levelsGained,
            xpGained: baseXP,
            totalXP: newXP
        };
    }

    // async sendLevelUpMessage(message, newLevel) {
    //     const user = message.author;

    //     const title = '🎉 ¡Subida de Nivel!';
    //     const description = `¡Felicidades ${user}! Has alcanzado el **Nivel ${newLevel}**!`;
    //     const color = COLORS.SUCCESS;

    //     const embed = new EmbedBuilder()
    //         .setTitle(title)
    //         .setDescription(description)
    //         .setColor(color)
    //         .setThumbnail(user.displayAvatarURL({ extension: 'png', size: 128 }))
    //         .setTimestamp();

    //     try {
    //         await message.channel.send({ embeds: [embed] });
    //     } catch (error) {
    //         console.error('Failed to send level up message:', error);
    //         // Fallback to simple message
    //         await message.channel.send(`🎉 ¡Felicidades ${user}! ¡Has alcanzado el nivel ${newLevel}!`);
    //     }
    // }

    checkLevelMilestone(level) {
        const milestones = {
            5: 'Has alcanzado tu primer hito importante!',
            10: '¡Doble dígito! Sigues subiendo!',
            25: '¡Un cuarto del camino hacia los 100!',
            50: '¡Medio centenar! Eres imparable!',
            75: '¡Tres cuartos del camino! Solo 25 niveles más para los 100!',
            100: '¡CENTENARIO! Has alcanzado el nivel 100! 🎊'
        };

        return milestones[level] || null;
    }

    async getUserXP(userId, guildId) {
        return await userRepository.getUserXP(userId, guildId);
    }

    async getUserXPData(userId, guildId) {
        const userData = await userRepository.getUserXP(userId, guildId);

        if (!userData) {
            return null;
        }

        const progress = XPCalculator.calculateLevelProgress(
            userData.xp,
            userData.level
        );

        const rank = await userRepository.getUserRank(
            guildId,
            userData.level,
            userData.xp
        );

        return {
            ...userData,
            rank,
            progress,
            nextLevelXP: progress.totalNeededXP,
            progressPercent: progress.progressPercent
        };
    }

    async resetUserXP(userId, guildId) {
        return await userRepository.resetUser(userId, guildId);
    }

    async setUserXP(userId, guildId, xp, level) {
        return await userRepository.setUserXPLevel(userId, guildId, xp, level);
    }

    async getLeaderboard(guildId, limit) {
        return await userRepository.getLeaderboard(guildId, limit);
    }

    getStats() {
        return {
            currentMultiplier: xpEventManager.getMultiplier(),
            isGlobalEventActive: xpEventManager.isGlobalMultiplierActive,
            cooldownStats: cooldownManager.getStats()
        };
    }
}

// Export singleton instance
export const xpService = new XPService();
