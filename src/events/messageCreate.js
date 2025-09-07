import { xpService } from '../core/xp/XPService.js';

export default function registerMessageCreate(client) {
  client.on('messageCreate', async (message) => {

    const { content, mentions, author, channel } = message;
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

    if (content.startsWith('cb!fate')) {
      // Get mentioned users and/or text usernames
      const args = content.split(' ').slice(1);
      let users = Array.from(message.mentions.users.values());

      // Try to find users by username if not enough mentions
      if (users.length < 2 && args.length >= 1) {
        // Remove mention syntax from args
        const filteredArgs = args.filter(arg => !arg.startsWith('<@'));
        // Try to find users by username (case-insensitive, fuzzy match)
        for (let i = 0; i < filteredArgs.length && users.length < 2; i++) {
          const username = filteredArgs[i].trim().toLowerCase();
          let found = message.guild.members.cache.find(
            m => m.user.username.toLowerCase() === username
          );
          if (!found) {
            found = message.guild.members.cache.find(
              m => m.user.username.toLowerCase().includes(username)
            );
          }
          if (found && !users.some(u => u.id === found.user.id)) {
            users.push(found.user);
          }
        }
      }

      const mention = users[0];
      const secondMention = users[1];

      if (!mention) {
        return message.reply('Por favor, menciona a alguien o escribe su nombre para el fate.');
      }

      let fateAuthor = author;
      let fateMention = mention;

      // If there is a second mention, swap roles
      if (secondMention) {
        fateAuthor = mention;
        fateMention = secondMention;
      }

      if (fateMention.id === fateAuthor.id) {
        return message.reply('No puedes hacer fate contigo mismo.');
      }

      const responses = [
        'son amigos.',
        'son enemigos.',
        'son hermano/as.',
        'son amantes.',
        'son casados.',
        'son desconocidos.',
        'son socios de trabajo.',
        'son maestro y esclavo',
        'son crushes secretos.',
        'son almas gemelas.',
        'son mejores amigos.',
        'son complices de crimen.',
        'son egirl y simp.',
        'son duo bot.',
        'son prometidos por error'
      ];

      const response = responses[Math.floor(Math.random() * responses.length)];
      return channel.send(`${fateAuthor} y ${fateMention} ${response}`);
    }

    if (content.startsWith('cb!say')) {
      const text = content.split(' ').slice(1).join(' ');
      if (!text) {
        return message.reply('Por favor, proporciona un mensaje para decir.');
      }
      await message.delete();
      return channel.send(text);
    }
  });
}
