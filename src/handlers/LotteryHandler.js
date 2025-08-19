const { Markup } = require('telegraf');
const config = require('../config');

class LotteryHandler {
  constructor(userService, walletService) {
    this.userService = userService;
    this.walletService = walletService;
    this.lotteries = new Map();
    this.tickets = new Map();
  }

  isAdmin(ctx) {
    return String(ctx.from.id) === config.ADMIN_ID;
  }

  // Показать активные розыгрыши
  async showLotteries(ctx) {
    const user = await this.userService.getUser(ctx.from.id);
    if (!user || !user.rulesAccepted) {
      return ctx.reply('Сначала ознакомьтесь с правилами!');
    }

    if (this.lotteries.size === 0) {
      return ctx.reply('🎁 Активных розыгрышей пока нет\\n\\nСледите за обновлениями!');
    }

    let message = '🎁 АКТИВНЫЕ РОЗЫГРЫШИ:\\n\\n';
    let buttons = [];
    
    for (const [id, lottery] of this.lotteries) {
      message += `🏆 ${lottery.title}\\n`;
      message += `💰 Цена билета: ${lottery.price} руб.\\n`;
      message += `👥 Участников: ${lottery.participants}/${lottery.maxParticipants}\\n`;
      message += `⏰ До завершения: ${lottery.timeLeft}\\n\\n`;
      
      buttons.push([`🎫 Купить билет - ${lottery.title}`]);
    }

    buttons.push(['🔙 Главное меню']);
    
    await ctx.reply(message, Markup.keyboard(buttons).resize());
  }

  async showMyTickets(ctx) {
    const user = await this.userService.getUser(ctx.from.id);
    if (!user || !user.rulesAccepted) {
      return ctx.reply('Сначала ознакомьтесь с правилами!');
    }

    // Получаем билеты из AdminHandler
    const userTickets = Array.from(global.adminHandler?.tickets?.values() || []).filter(
      ticket => ticket.userId == ctx.from.id
    );

    if (userTickets.length === 0) {
      const keyboard = Markup.keyboard([['🔙 Главное меню']]).resize();
      return ctx.reply('🎫 У вас пока нет билетов\n\nПриобретите билет в разделе "🎁 Розыгрыш"', keyboard);
    }

    let message = '🎫 ВАШИ БИЛЕТЫ:\n\n';
    
    userTickets.forEach((ticket, index) => {
      message += `${index + 1}. ${ticket.lotteryTitle || 'Неизвестный розыгрыш'}\n`;
      message += `🆔 ID: ${ticket.id}\n`;
      message += `💰 Цена: ${ticket.price} руб.\n`;
      message += `📅 Дата: ${ticket.createdAt.toLocaleDateString('ru-RU')}\n\n`;
    });

    const keyboard = Markup.keyboard([['🔙 Главное меню']]).resize();
    await ctx.reply(message, keyboard);
  }

  async showWallet(ctx) {
    const user = await this.userService.getUser(ctx.from.id);
    if (!user || !user.rulesAccepted) {
      return ctx.reply('Сначала ознакомьтесь с правилами!');
    }

    return this.walletService.showWallet(ctx);
  }

  async showReferrals(ctx) {
    const user = await this.userService.getUser(ctx.from.id);
    if (!user || !user.rulesAccepted) {
      return ctx.reply('Сначала ознакомьтесь с правилами!');
    }

    return global.referralService?.showReferrals(ctx) || ctx.reply('Функция в разработке');
  }

  async showHistory(ctx) {
    const user = await this.userService.getUser(ctx.from.id);
    if (!user || !user.rulesAccepted) {
      return ctx.reply('Сначала ознакомьтесь с правилами!');
    }

    const userTickets = Array.from(global.adminHandler?.tickets?.values() || []).filter(
      ticket => ticket.userId == ctx.from.id
    );
    
    const totalSpent = userTickets.reduce((sum, ticket) => sum + parseFloat(ticket.price), 0);
    const totalTickets = userTickets.length;

    const message = `📜 ИСТОРИЯ УЧАСТИЯ\n\n` +
      `🎫 Всего билетов: ${totalTickets}\n` +
      `🏆 Выигрышей: 0\n` +
      `💰 Потрачено: ${totalSpent} руб.\n` +
      `🎁 Выиграно: 0 руб.\n\n` +
      (totalTickets === 0 ? '📊 История пуста. Начните участвовать в розыгрышах!' : '📊 Удачи в будущих розыгрышах!');

    const keyboard = Markup.keyboard([['🔙 Главное меню']]).resize();
    await ctx.reply(message, keyboard);
  }

  // Админские функции
  async addLottery(ctx) {
    if (!this.isAdmin(ctx)) return;

    // Создаем тестовый розыгрыш
    const lotteryId = Date.now().toString();
    const lottery = {
      id: lotteryId,
      title: 'iPhone 15 Pro',
      price: 500,
      participants: 15,
      maxParticipants: 100,
      timeLeft: '2 дня 5 часов',
      status: 'active'
    };

    this.lotteries.set(lotteryId, lottery);

    await ctx.reply(`✅ Розыгрыш "${lottery.title}" добавлен!\\n\\n` +
      `💰 Цена билета: ${lottery.price} руб.\\n` +
      `👥 Максимум участников: ${lottery.maxParticipants}`);
  }

  async finishLottery(ctx) {
    if (!this.isAdmin(ctx)) return;

    if (this.lotteries.size === 0) {
      return ctx.reply('❌ Нет активных розыгрышей для завершения');
    }

    // Завершаем первый розыгрыш
    const [lotteryId, lottery] = this.lotteries.entries().next().value;
    this.lotteries.delete(lotteryId);

    const winner = 'Пользователь #12345'; // Заглушка
    
    await ctx.reply(`🏆 РОЗЫГРЫШ ЗАВЕРШЕН!\\n\\n` +
      `🎁 Приз: ${lottery.title}\\n` +
      `🎉 Победитель: ${winner}\\n` +
      `🎫 Выигрышный билет: #${Math.floor(Math.random() * 1000)}`);
  }

  async setPrice(ctx) {
    if (!this.isAdmin(ctx)) return;

    const message = `💰 УПРАВЛЕНИЕ ЦЕНАМИ\\n\\n` +
      `Текущие цены билетов:\\n` +
      `🎁 Обычный приз: 100-500 руб.\\n` +
      `🏆 Премиум приз: 500-1500 руб.\\n\\n` +
      `Для изменения цен обратитесь к разработчику`;

    await ctx.reply(message);
  }

  async broadcast(ctx) {
    if (!this.isAdmin(ctx)) return;

    const stats = await this.userService.getStats();
    
    const message = `✉ РАССЫЛКА СООБЩЕНИЙ\\n\\n` +
      `👥 Получателей: ${stats.total}\\n\\n` +
      `📝 Отправьте следующим сообщением текст для рассылки или нажмите "Отмена"`;

    const keyboard = Markup.keyboard([
      ['❌ Отмена'],
      ['🔙 Админ-панель']
    ]).resize();

    await ctx.reply(message, keyboard);
  }
}

module.exports = LotteryHandler;