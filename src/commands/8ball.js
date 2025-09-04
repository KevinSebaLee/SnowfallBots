/**
 * 8Ball Command
 * Magic 8-ball responses
 */

import { SlashCommandBuilder } from 'discord.js';

const responses = [
  'Es cierto.',
  'Es decididamente así.',
  'Sin lugar a dudas.',
  'Sí definitivamente.',
  'Puedes confiar en ello.',
  'Como yo lo veo, sí.',
  'Muy probable.',
  'Las perspectivas son buenas.',
  'Sí.',
  'Las señales apuntan a que sí.',
  'Respuesta confusa, vuelve a intentarlo.',
  'Pregunta de nuevo más tarde.',
  'Mejor no decirte ahora.',
  'No se puede predecir ahora.',
  'Concéntrate y pregunta de nuevo.',
  'No cuentes con ello.',
  'Mi respuesta es no.',
  'Mis fuentes dicen que no.',
  'Las perspectivas no son tan buenas.',
  'Muy dudoso.'
];

const data = new SlashCommandBuilder()
  .setName('8ball')
  .setDescription('Pregúntale algo a la bola mágica')
  .addStringOption(option =>
    option.setName('question')
      .setDescription('Tu pregunta')
      .setRequired(true)
  );

const execute = async (interaction) => {
  const question = interaction.options.getString('question');
  const response = responses[Math.floor(Math.random() * responses.length)];
  
  await interaction.reply({
    content: `🎱 **Pregunta:** ${question}\n**Respuesta:** ${response}`
  });
};

const ball8Command = { data, execute };
export default ball8Command;
