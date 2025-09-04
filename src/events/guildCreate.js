/**
 * Guild Create Event Handler
 * Handles when the bot joins a new guild
 */

export default function registerGuildCreateEvent(client) {
  client.on('guildCreate', async (guild) => {
    console.log(`Joined new guild: ${guild.name} (ID: ${guild.id})`);
    console.log(`Guild has ${guild.memberCount} members`);
  });
}
