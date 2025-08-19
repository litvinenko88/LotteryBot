const config = require('../config');
const logger = require('../utils/logger');
const DatabaseService = require('./DatabaseService');
const UserService = require('./UserService');
const StartHandler = require('../handlers/StartHandler');
const AdminHandler = require('../handlers/AdminHandler');
const TestHandler = require('../handlers/TestHandler');
const LotteryHandler = require('../handlers/LotteryHandler');

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
    
    // Регистрируем модели
    const LotteryModel = require('../models/Lottery');
    const TicketModel = require('../models/Ticket');
    const LotteryViewModel = require('../models/LotteryView');
    
    this.dbService.sequelize.define('Lottery', LotteryModel(this.dbService.sequelize).rawAttributes, LotteryModel(this.dbService.sequelize).options);
    this.dbService.sequelize.define('Ticket', TicketModel(this.dbService.sequelize).rawAttributes, TicketModel(this.dbService.sequelize).options);
    this.dbService.sequelize.define('LotteryView', LotteryViewModel(this.dbService.sequelize).rawAttributes, LotteryViewModel(this.dbService.sequelize).options);
    
    this.userService = new UserService(this.dbService.getModel('User'));
    this.startHandler = new StartHandler(this.userService);
    this.adminHandler = new AdminHandler(this.userService, this.bot);
    this.lotteryHandler = new LotteryHandler(this.userService);
    this.testHandler = new TestHandler(this.userService, this.startHandler, this.adminHandler);
    
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
    
    // Админ обработчики
    this.bot.hears('🛠 Админ-панель', (ctx) => this.adminHandler.showPanel(ctx));
    this.bot.hears('📊 Статистика', (ctx) => this.adminHandler.showStats(ctx));
    this.bot.hears('👥 Подписчики', (ctx) => this.adminHandler.showSubscribers(ctx));
    this.bot.hears('🎁 Розыгрыши', (ctx) => this.adminHandler.showLotteries(ctx));
    this.bot.hears('💰 Баланс', (ctx) => this.adminHandler.showBalance(ctx));
    this.bot.hears('🏆 Узнать победителя', (ctx) => this.adminHandler.findWinner(ctx));
    this.bot.hears('➕ Добавить розыгрыш', (ctx) => this.adminHandler.startLotteryCreation(ctx));
    this.bot.hears('👁 Просмотреть', (ctx) => this.adminHandler.previewLottery(ctx));
    this.bot.hears('✏️ Редактировать', (ctx) => this.adminHandler.editLottery(ctx));
    this.bot.hears('✅ Добавить', (ctx) => this.adminHandler.saveLottery(ctx));
    
    // Обработчик inline кнопок
    this.bot.action(/buy_ticket_(.+)/, async (ctx) => {
      const lotteryId = parseInt(ctx.match[1]);
      const ticket = await this.adminHandler.buyTicket(ctx.from.id, lotteryId);
      
      if (ticket) {
        await ctx.answerCbQuery(`✅ Билет куплен! ID: ${ticket.id}`);
        await ctx.reply(`🎫 Билет успешно куплен!\n\n🆔 ID билета: ${ticket.id}\n💰 Стоимость: ${ticket.price} руб.`);
      } else {
        await ctx.answerCbQuery('❌ Розыгрыш не найден');
      }
    });
    this.bot.hears('🏆 Завершить розыгрыш', (ctx) => this.lotteryHandler.finishLottery(ctx));
    this.bot.hears('💰 Установить цену', (ctx) => this.lotteryHandler.setPrice(ctx));
    this.bot.hears('✉ Рассылка', (ctx) => this.lotteryHandler.broadcast(ctx));
    
    // Тестовые обработчики
    this.bot.hears('🧪 Режим тестирования', (ctx) => this.testHandler.showTestPanel(ctx));
    this.bot.hears('🧪 Тест как новый пользователь', (ctx) => this.testHandler.testAsNewUser(ctx));
    this.bot.hears('🧪 Тест как старый пользователь', (ctx) => this.testHandler.testAsOldUser(ctx));
    this.bot.hears('🧪 Тест без принятых правил', (ctx) => this.testHandler.testWithoutRules(ctx));
    this.bot.hears('🧪 Тест с принятыми правилами', (ctx) => this.testHandler.testWithRules(ctx));
    this.bot.hears('🧪 Показать все кнопки пользователя', (ctx) => this.testHandler.showAllUserButtons(ctx));
    this.bot.hears('🧪 Показать все админ кнопки', (ctx) => this.testHandler.showAllAdminButtons(ctx));
    this.bot.hears('🧪 Симуляция полного процесса', (ctx) => this.testHandler.simulateFullProcess(ctx));
    this.bot.hears('🧪 Тест системы розыгрышей', (ctx) => this.testHandler.testLotterySystem(ctx));
    this.bot.hears('🔙 Назад в админ-панель', (ctx) => this.testHandler.exitTestMode(ctx));
    this.bot.hears('❌ Отмена', (ctx) => this.adminHandler.showPanel(ctx));
    this.bot.hears('🔙 Админ-панель', (ctx) => this.adminHandler.showPanel(ctx));
    
    // Основные обработчики
    this.bot.hears('🔙 Главное меню', (ctx) => this.startHandler.handle(ctx));
    
    this.bot.hears('📜 Ознакомиться с правилами', (ctx) => this.startHandler.showRules(ctx));
    this.bot.hears('✅ Я ознакомился с правилами', (ctx) => this.startHandler.acceptRules(ctx));
    
    // Общий обработчик сообщений
    this.bot.on('message', async (ctx) => {
      // Проверяем создание розыгрыша (текст и фото)
      if (await this.adminHandler.handleLotteryCreation(ctx)) {
        return;
      }
      
      // Проверяем тестовый режим
      if (await this.testHandler.handleTestModeMessage(ctx)) {
        return;
      }
      
      // Обработка только текстовых сообщений
      if (!ctx.message.text) return;
      
      // Проверяем статистику розыгрыша
      const text = ctx.message.text;
      if (text && text.startsWith('📊 Статистика - ')) {
        const lotteryTitle = text.replace('📊 Статистика - ', '');
        await this.adminHandler.showLotteryStats(ctx, lotteryTitle);
        return;
      }
      
      // Обработка основных кнопок
      switch (text) {
        case '🎁 Розыгрыш':
          await this.lotteryHandler.showLotteries(ctx);
          break;
        case '🎫 Мои билеты':
          await this.lotteryHandler.showMyTickets(ctx);
          break;
        case '👥 Рефералы':
          await this.lotteryHandler.showReferrals(ctx);
          break;
        case '📜 История':
          await this.lotteryHandler.showHistory(ctx);
          break;
        case '💰 Кошелек':
          await this.lotteryHandler.showWallet(ctx);
          break;
        case '💳 Пополнить кошелек':
          await ctx.reply('💳 ПОПОЛНЕНИЕ КОШЕЛЬКА\n\nВыберите способ пополнения:', 
            Markup.keyboard([['💳 Банковская карта', '📱 СБП'], ['🔙 Назад']]).resize());
          break;
        case '📊 История операций':
          await ctx.reply('📊 История операций пуста');
          break;
        case '📤 Поделиться ссылкой':
          await ctx.reply('📤 Поделитесь этой ссылкой с друзьями:\nhttps://t.me/your_bot?start=ref_' + ctx.from.id);
          break;
        case '🔙 Назад':
          await this.startHandler.handle(ctx);
          break;
      }
    });
  }
}

module.exports = BotService;