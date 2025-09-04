/**
 * Events Index
 * Registers all Discord bot event handlers
 */

import ready from './ready.js';
import guildCreate from './guildCreate.js';
import interactionCreate from './interactionCreate.js';
import messageCreate from './messageCreate.js';

export default function registerEvents(client) {
  ready(client);
  guildCreate(client);
  interactionCreate(client);
  messageCreate(client);
}
