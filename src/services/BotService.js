const config = require('../config');
const logger = require('../utils/logger');
const DatabaseService = require('./DatabaseService');
const UserService = require('./UserService');
const StartHandler = require('../handlers/StartHandler');
const AdminHandler = require('../handlers/AdminHandler');

class BotService {
  constructor(bot) {
    this.bot = bot;
    this.setupMiddleware();
  }

  async init() {
    const { Sequelize } = require('sequelize');
    const sequelize = new Sequelize(config.DATABASE);
    
    this.dbService = new DatabaseService(sequelize);
    await this.dbService.init();
    
    this.userService = new UserService(this.dbService.getModel('User'));
    this.startHandler = new StartHandler(this.userService);
    this.adminHandler = new AdminHandler(this.userService);
    
    this.setupHandlers();
    logger.info('BotService инициализирован');
  }

  setupMiddleware() {
    this.bot.use(async (ctx, next) => {
      ctx.isAdmin = String(ctx.from.id) === config.ADMIN_ID;
      return next();
    });
  }

  setupHandlers() {
    this.bot.start((ctx) => this.startHandler.handle(ctx));
    
    this.bot.hears('🛠 Админ-панель', (ctx) => this.adminHandler.showPanel(ctx));
    this.bot.hears('📊 Статистика', (ctx) => this.adminHandler.showStats(ctx));
    this.bot.hears('👥 Подписчики', (ctx) => this.adminHandler.showSubscribers(ctx));
    
    this.bot.hears('🔙 Главное меню', (ctx) => this.startHandler.handle(ctx));
    
    this.bot.hears(['🎁 Розыгрыш', '🎫 Мои билеты', '👥 Рефералы', '📜 История', '💰 Кошелек'], 
      (ctx) => ctx.reply(`Раздел "${ctx.message.text}" в разработке`));
  }
}

module.exports = BotService;