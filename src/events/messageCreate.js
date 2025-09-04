/**
 * Message Create Event Handler
 * Handles message events and XP gain
 */

import { xpService } from '../core/xp/XPService.js';

export default function registerMessageCreate(client) {
  client.on('messageCreate', async (message) => {
    // Ignore bot messages
    if (message.author.bot) return;
    
    // Ignore DMs
    if (!message.guild) return;

    try {
      // Process XP gain
      await xpService.processMessageXP(message);
    } catch (error) {
      console.error('Error handling message XP:', error);
    }
  });
}
