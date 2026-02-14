/**
 * 8Ball Command
 * Magic 8-ball responses
 */

import pkg from 'discord.js';
const { SlashCommandBuilder } = pkg;

const data = new SlashCommandBuilder()
  .setName('8ball')
  .setDescription('Pregunta algo a la bola 8 mágica')
  .addStringOption(option =>
    option.setName('question')
      .setDescription('Tu pregunta')
      .setRequired(true)
  );

const responses = [
  'Es cierto.',
  'Definitivamente es así.',
  'Sin duda.',
  'Sí, definitivamente.',
  'Puedes confiar en ello.',
  'Como yo lo veo, sí.',
  'Lo más probable.',
  'Las perspectivas son buenas.',
  'Sí.',
  'Las señales apuntan a que sí.',
  'Respuesta turbia, intenta de nuevo.',
  'Pregunta de nuevo más tarde.',
  'Mejor no te lo digo ahora.',
  'No se puede predecir ahora.',
  'Concéntrate y pregunta de nuevo.',
  'No cuentes con ello.',
  'Mi respuesta es no.',
  'Mis fuentes dicen que no.',
  'Las perspectivas no son muy buenas.',
  'Muy dudoso.'
];

const execute = async (interaction) => {
  try {
    const question = interaction.options.getString('question');
    const response = responses[Math.floor(Math.random() * responses.length)];
    
    await interaction.reply({
      content: `🎱 **${question}**\n${response}`,
      flags: 0 // Public response
    });
  } catch (error) {
    console.error('Error in 8ball command:', error);
    
    if (interaction.deferred) {
      await interaction.editReply('Error al ejecutar el comando.');
    } else {
      await interaction.reply({ content: 'Error al ejecutar el comando.', flags: 64 }); // 64 = ephemeral
    }
  }
};

export default { data, execute };
