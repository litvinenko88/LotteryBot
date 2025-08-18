const { Markup } = require('telegraf');
const config = require('../config');

class LotteryHandler {
  constructor(userService) {
    this.userService = userService;
    this.lotteries = new Map(); // Временное хранилище розыгрышей
    this.tickets = new Map(); // Временное хранилище билетов
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

  // Показать билеты пользователя
  async showMyTickets(ctx) {
    const user = await this.userService.getUser(ctx.from.id);
    if (!user || !user.rulesAccepted) {
      return ctx.reply('Сначала ознакомьтесь с правилами!');
    }

    const userTickets = Array.from(this.tickets.values()).filter(
      ticket => ticket.userId === ctx.from.id
    );

    if (userTickets.length === 0) {
      return ctx.reply('🎫 У вас пока нет билетов\\n\\nПриобретите билет в разделе "🎁 Розыгрыш"');
    }

    let message = '🎫 ВАШИ БИЛЕТЫ:\\n\\n';
    
    userTickets.forEach((ticket, index) => {
      message += `${index + 1}. ${ticket.lotteryTitle}\\n`;
      message += `🎫 Номер билета: ${ticket.number}\\n`;
      message += `📅 Дата покупки: ${ticket.purchaseDate}\\n`;
      message += `🎯 Статус: ${ticket.status}\\n\\n`;
    });

    await ctx.reply(message);
  }

  // Показать кошелек
  async showWallet(ctx) {
    const user = await this.userService.getUser(ctx.from.id);
    if (!user || !user.rulesAccepted) {
      return ctx.reply('Сначала ознакомьтесь с правилами!');
    }

    const balance = user.balance || 0;
    
    const message = `💰 ВАШ КОШЕЛЕК\\n\\n💳 Баланс: ${balance} руб.\\n\\n💡 Пополните кошелек для участия в розыгрышах`;
    
    const keyboard = Markup.keyboard([
      ['💳 Пополнить кошелек'],
      ['📊 История операций'],
      ['🔙 Главное меню']
    ]).resize();

    await ctx.reply(message, keyboard);
  }

  // Показать рефералов
  async showReferrals(ctx) {
    const user = await this.userService.getUser(ctx.from.id);
    if (!user || !user.rulesAccepted) {
      return ctx.reply('Сначала ознакомьтесь с правилами!');
    }

    const referralLink = `https://t.me/your_bot?start=ref_${ctx.from.id}`;
    const referralsCount = 0; // Заглушка
    const referralBonus = referralsCount * 50; // 50 руб за реферала

    const message = `👥 РЕФЕРАЛЬНАЯ СИСТЕМА\\n\\n` +
      `🔗 Ваша ссылка:\\n${referralLink}\\n\\n` +
      `👥 Приглашено: ${referralsCount} человек\\n` +
      `💰 Заработано: ${referralBonus} руб.\\n\\n` +
      `💡 За каждого приглашенного друга вы получаете 50 рублей на баланс!`;

    const keyboard = Markup.keyboard([
      ['📤 Поделиться ссылкой'],
      ['🔙 Главное меню']
    ]).resize();

    await ctx.reply(message, keyboard);
  }

  // Показать историю
  async showHistory(ctx) {
    const user = await this.userService.getUser(ctx.from.id);
    if (!user || !user.rulesAccepted) {
      return ctx.reply('Сначала ознакомьтесь с правилами!');
    }

    const message = `📜 ИСТОРИЯ УЧАСТИЯ\\n\\n` +
      `🎫 Всего билетов: 0\\n` +
      `🏆 Выигрышей: 0\\n` +
      `💰 Потрачено: 0 руб.\\n` +
      `🎁 Выиграно: 0 руб.\\n\\n` +
      `📊 История пуста. Начните участвовать в розыгрышах!`;

    await ctx.reply(message);
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