/**
 * Ready Event Handler
 * Handles bot startup and initialization
 */

export default function registerReadyEvent(client) {
  client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    console.log(`Bot is ready! Serving ${client.guilds.cache.size} guilds.`);
    
    // Set bot status
    client.user.setActivity('Managing XP and levels', { type: 'WATCHING' });
  });
}
