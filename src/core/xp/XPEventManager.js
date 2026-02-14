import pkg from 'discord.js';
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = pkg;
import { XP_CONFIG, COLORS } from '../../config/constants.js';
import { userRepository } from '../database/UserRepository.js';
import { XPCalculator } from './XPCalculator.js';

export class XPEventManager {
  constructor() {
    this.isGlobalMultiplierActive = false;
    this.currentMultiplier = XP_CONFIG.DEFAULT_MULTIPLIER;
    this.globalMultiplierTimeout = null;
  }

  getMultiplier() {
    return this.currentMultiplier;
  }

  async maybeActivateGlobalMultiplier(message) {
    if (this.isGlobalMultiplierActive || 
        message.author.bot || 
        Math.random() >= XP_CONFIG.GLOBAL_MULTIPLIER_CHANCE) {
      return false;
    }

    await this.activateGlobalMultiplier(message.channel);
    return true;
  }

  async activateGlobalMultiplier(channel) {
    this.isGlobalMultiplierActive = true;
    this.currentMultiplier = XP_CONFIG.EVENT_MULTIPLIER;

    const embed = new EmbedBuilder()
      .setTitle('¡Evento de Multiplicador de XP!')
      .setDescription(`¡Durante los próximos ${XP_CONFIG.GLOBAL_MULTIPLIER_DURATION / 60000} minutos, todos ganan XP doble! 🎉`)
      .setColor(COLORS.WARNING);

    await channel.send({ embeds: [embed] });

    // Schedule event end
    this.globalMultiplierTimeout = setTimeout(async () => {
      await this.deactivateGlobalMultiplier(channel);
    }, XP_CONFIG.GLOBAL_MULTIPLIER_DURATION);
  }

  async deactivateGlobalMultiplier(channel) {
    this.currentMultiplier = XP_CONFIG.DEFAULT_MULTIPLIER;
    this.isGlobalMultiplierActive = false;

    if (this.globalMultiplierTimeout) {
      clearTimeout(this.globalMultiplierTimeout);
      this.globalMultiplierTimeout = null;
    }

    const endEmbed = new EmbedBuilder()
      .setTitle('Fin del Evento de XP')
      .setDescription('¡El evento de XP doble ha terminado!')
      .setColor(COLORS.PRIMARY);

    await channel.send({ embeds: [endEmbed] });
  }

  async maybeActivateQuickXPEvent(message) {
    if (message.author.bot || Math.random() >= XP_CONFIG.QUICK_XP_EVENT_CHANCE) {
      return false;
    }

    await this.activateQuickXPEvent(message.channel);
    return true;
  }

  async activateQuickXPEvent(channel) {
    const embed = new EmbedBuilder()
      .setTitle('¡Evento de XP Rápido!')
      .setDescription('¡El primero en presionar el botón gana XP extra! 🚀')
      .setColor(COLORS.PRIMARY);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('xp_event_button')
        .setLabel('¡Presióname!')
        .setStyle(ButtonStyle.Primary)
    );

    const sentMessage = await channel.send({ embeds: [embed], components: [row] });

    try {
      const filter = (interaction) => 
        interaction.customId === 'xp_event_button' && !interaction.user.bot;
      
      const interaction = await sentMessage.awaitMessageComponent({ 
        filter, 
        componentType: ComponentType.Button, 
        time: XP_CONFIG.QUICK_XP_EVENT_TIMEOUT 
      });

      await this.handleQuickXPWinner(interaction);
    } catch (error) {
      // Timeout occurred
      await sentMessage.edit({ 
        content: 'Nadie presionó el botón a tiempo.', 
        components: [],
        embeds: []
      });
    }
  }

  async handleQuickXPWinner(interaction) {
    const winnerId = interaction.user.id;
    const bonusXP = XPCalculator.generateBonusXP();

    const userData = await userRepository.getUserXP(winnerId);
    
    if (!userData) {
      // Create new user with bonus XP
      await userRepository.createUser(winnerId, bonusXP, 1);
    } else {
      // Add bonus XP to existing user
      const newXP = userData.global_xp + bonusXP;
      const levelUpInfo = XPCalculator.checkLevelUp(newXP, userData.global_level);
      
      await userRepository.updateUserXP(
        winnerId, 
        newXP, 
        levelUpInfo.shouldLevelUp ? levelUpInfo.newLevel : userData.global_level
      );
    }

    await interaction.reply({ 
      content: `¡Ganaste ${bonusXP} XP extra!`, 
      ephemeral: true 
    });
  }


  cleanup() {
    if (this.globalMultiplierTimeout) {
      clearTimeout(this.globalMultiplierTimeout);
      this.globalMultiplierTimeout = null;
    }
    
    this.isGlobalMultiplierActive = false;
    this.currentMultiplier = XP_CONFIG.DEFAULT_MULTIPLIER;
  }
}

export const xpEventManager = new XPEventManager();
