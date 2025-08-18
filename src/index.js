const { Telegraf } = require('telegraf');
const config = require('./config');
const logger = require('./utils/logger');
const BotService = require('./services/BotService');

class LotteryBot {
  constructor() {
    this.bot = new Telegraf(config.BOT_TOKEN);
    this.botService = new BotService(this.bot);
  }

  async start() {
    try {
      await this.botService.init();
      
      this.bot.launch();
      logger.info('🚀 Lottery Bot запущен');
    } catch (error) {
      logger.error('Ошибка запуска:', error);
      process.exit(1);
    }
  }

  stop() {
    this.bot.stop();
    logger.info('Bot остановлен');
  }
}

const lotteryBot = new LotteryBot();

process.once('SIGINT', () => lotteryBot.stop());
process.once('SIGTERM', () => lotteryBot.stop());

if (require.main === module) {
  lotteryBot.start();
}

module.exports = lotteryBot;