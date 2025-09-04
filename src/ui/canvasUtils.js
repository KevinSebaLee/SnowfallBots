/**
 * Canvas Utility Functions
 * Reusable drawing functions for consistent UI components
 */

/**
 * Draws a fully rounded rectangle
 */
export function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Draws a rectangle with only left corners rounded
 */
export function drawRoundedRectLeft(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width, y);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Draws a circular avatar with clipping and optional border
 */
export function drawCircularAvatar(ctx, avatarImg, x, y, size, borderWidth = 0, borderColor = '#000') {
  // Draw avatar with circular clipping
  ctx.save();
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatarImg, x, y, size, size);
  ctx.restore();

  // Optional border
  if (borderWidth > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2 + borderWidth, 0, Math.PI * 2, true);
    ctx.lineWidth = borderWidth * 2;
    ctx.strokeStyle = borderColor;
    ctx.stroke();
    ctx.restore();
  }
}

/**
 * Gets rank color based on position
 */
export function getRankColor(position) {
  if (position === 1) return '#FFD700'; // Gold
  if (position === 2) return '#C0C0C0'; // Silver  
  if (position === 3) return '#CD7F32'; // Bronze
  return '#444'; // Default
}

/**
 * Draws text with shadow
 */
export function drawTextWithShadow(ctx, text, x, y, fillColor = '#444', shadowColor = 'rgba(0,0,0,0.35)', shadowBlur = 2) {
  ctx.save();
  ctx.shadowColor = shadowColor;
  ctx.shadowBlur = shadowBlur;
  ctx.fillStyle = fillColor;
  ctx.fillText(text, x, y);
  ctx.restore();
}
