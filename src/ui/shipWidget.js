import { createCanvas, loadImage } from 'canvas';
import { COLORS } from '../config/constants.js';
import { drawRoundedRect, drawCircularAvatar } from './canvasUtils.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// shipUtils.js

export async function createUsersCanva(userA, userB, porcent) {
    const width = 450;
    const height = 250;
    const avatarSize = 95;
    const padding = 40;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Background with a solid gradient instead of an image
    ctx.save();

    const background = await loadImage(path.join(dirname(fileURLToPath(import.meta.url)), '../assets/banner/ship_banner.gif'));

    ctx.drawImage(background, 0, 0, width, height);

    // Set up variables for later positioning
    const canvasAspect = width / height;

    // We've replaced the background image with a gradient, so no need for this code
    ctx.restore();

    // Draw dark rounded rectangle behind avatars, heart, porcent, and names
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = '#18191c';

    // Make rectangle slightly bigger and ensure avatars & heart fit inside
    const rectHeight = 170;
    const rectY = (height - rectHeight) / 2;
    const rectX = padding - 10;
    const rectWidth = width - (padding - 10) * 2;
    const radius = 36;

    drawRoundedRect(ctx, rectX, rectY, rectWidth, rectHeight, radius);
    ctx.fill();
    ctx.restore();

    // Load avatars with error handling
    let avatarA, avatarB;
    try {
        avatarA = await loadImage(userA);
    } catch (err) {
        console.error('Failed to load avatar A:', err);
        avatarA = await loadImage('https://cdn.discordapp.com/embed/avatars/0.png');
    }
    try {
        avatarB = await loadImage(userB);
    } catch (err) {
        console.error('Failed to load avatar B:', err);
        avatarB = await loadImage('https://cdn.discordapp.com/embed/avatars/1.png');
    }

    // Calculate vertical center of rectangle
    const rectCenterY = rectY + rectHeight / 2;

    // Avatars: vertically centered in rectangle, horizontally inside rectangle
    const avatarY = rectCenterY - avatarSize / 2;
    const avatarAX = rectX + 20;
    const avatarBX = rectX + rectWidth - avatarSize - 20;

    drawCircularAvatar(ctx, avatarA, avatarAX, avatarY, avatarSize);
    drawCircularAvatar(ctx, avatarB, avatarBX, avatarY, avatarSize);

    // Heart: centered horizontally, vertically in rectangle
    ctx.font = '64px Sans';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    const heartY = rectCenterY + 22;
    ctx.fillText('❤️', width / 2, heartY);

    // Percentage: below heart, but still inside rectangle
    ctx.font = 'bold 28px Sans';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    const percentY = heartY + 38;
    // Clamp percentY to not go outside rectangle
    ctx.fillText(`${porcent}%`, width / 2, Math.min(percentY, rectY + rectHeight - 10));

    return canvas.toBuffer('image/png');
}
