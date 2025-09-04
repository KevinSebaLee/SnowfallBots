/**
 * Leaderboard Widget
 * Renders leaderboard images using Canvas
 */

import { createCanvas, loadImage } from 'canvas';
import { XP_CONFIG, COLORS, DISCORD_CONFIG } from '../config/constants.js';
import { XPCalculator } from '../core/xp/XPCalculator.js';
import { drawRoundedRect, drawRoundedRectLeft, drawCircularAvatar, getRankColor } from './canvasUtils.js';

export async function drawLeaderboard(users) {
    const width = 650;
    const rowHeight = 70;
    const height = users.length * rowHeight + 50;
    const avatarSize = 50;
    const padding = 20;
    const gap = 15;
    const numberWidth = 80;
    const xpBarHeight = 18;
    const xpBarRadius = xpBarHeight / 2;
    const levelBoxSize = avatarSize;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, '#70bbe0');
    bgGradient.addColorStop(1, '#b5f5e1');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Draw each user
    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const y = 20 + i * rowHeight;

        // Load avatar image
        let avatarImg;
        try {
            avatarImg = await loadImage(user.avatarUrl || DISCORD_CONFIG.DEFAULT_AVATAR);
        } catch (e) {
            avatarImg = await loadImage(DISCORD_CONFIG.DEFAULT_AVATAR);
        }

        // Draw avatar (circle)
        const avatarX = padding;
        drawCircularAvatar(ctx, avatarImg, avatarX, y, avatarSize);

        // Align name and XP bar vertically centered with avatar
        const centerY = y + avatarSize / 2;
        const textX = avatarX + avatarSize + gap;

        // Calculate XP percent for the bar
        const level = user.global_level ?? user.level ?? 1;
        const xp = user.global_xp ?? user.xp ?? 0;
        const xpNeeded = XPCalculator.calculateTotalXPForLevel(level);
        const xpPercent = Math.max(0, Math.min(1, xp / xpNeeded));

        // XP bar should occupy the whole image, except for avatar and number box
        const xpBarX = textX;
        const xpBarY = centerY - xpBarHeight / 2;
        const xpBarWidth = width - textX - numberWidth - padding - gap;

        // Draw name (above XP bar, left aligned)
        ctx.font = '20px Sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textBaseline = 'bottom';
        ctx.textAlign = 'left';
        ctx.fillText(user.name, textX, xpBarY - 4);

        // Draw level (in a separate box to the right of the name)
        ctx.font = 'bold 16px Sans-serif';
        ctx.textBaseline = 'bottom';
        ctx.textAlign = 'left';
        const nameWidth = ctx.measureText(user.name).width;
        const levelBoxX = textX + nameWidth + 18;
        const levelBoxY = xpBarY - 24;
        const levelBoxW = 48;
        const levelBoxH = 26;

        // Draw level text inside the box
        ctx.save();
        ctx.font = 'bold 15px Sans-serif';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`Lv ${level}`, levelBoxX + levelBoxW / 2, levelBoxY + levelBoxH / 2);
        ctx.restore();

        // Draw XP bar background (rounded)
        ctx.save();
        ctx.fillStyle = '#cdcecf';
        drawRoundedRect(ctx, xpBarX, xpBarY, xpBarWidth, xpBarHeight, xpBarRadius);
        ctx.fill();
        ctx.restore();

        // Draw XP bar fill (rounded, only on the left if not full, both if full)
        ctx.save();
        if (xpPercent === 1) {
            // Full bar, round both ends
            drawRoundedRect(ctx, xpBarX, xpBarY, xpBarWidth, xpBarHeight, xpBarRadius);
        } else {
            // Not full, round only left side
            drawRoundedRectLeft(ctx, xpBarX, xpBarY, xpBarWidth * xpPercent, xpBarHeight, xpBarRadius);
        }
        ctx.clip();
        ctx.fillStyle = '#6ab0ff';
        ctx.fillRect(xpBarX, xpBarY, xpBarWidth * xpPercent, xpBarHeight);
        ctx.restore();

        // Draw XP text inside the bar, centered
        ctx.font = 'bold 14px Sans-serif';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        const xpText = `${xp} / ${Math.round(xpNeeded)} XP`;
        const textXInside = xpBarX + xpBarWidth / 2;
        const textYInside = xpBarY + xpBarHeight / 2;

        ctx.save();
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(xpText, textXInside, textYInside);
        ctx.restore();

        // Draw position number (right, big)
        ctx.save();
        ctx.font = 'bold 38px Sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const numberX = width - numberWidth / 2 - padding;
        const numberY = y + avatarSize / 2;

        ctx.fillStyle = getRankColor(i + 1);
        ctx.fillText(`#${i + 1}`, numberX, numberY);
        ctx.restore();
    }

    return {
        buffer: canvas.toBuffer('image/png'),
        filename: 'leaderboard.png'
    };
}
