const { Markup } = require('telegraf');
const config = require('../config');

class AdminHandler {
  constructor(userService, bot) {
    this.userService = userService;
    this.bot = bot;
    this.lotteryCreation = new Map();
    this.activeLotteries = new Map(); // Активные розыгрыши
    this.tickets = new Map(); // Билеты
    this.views = new Map(); // Просмотры
  }

  isAdmin(ctx) {
    return String(ctx.from.id) === config.ADMIN_ID;
  }

  async showLotteries(ctx) {
    if (!this.isAdmin(ctx)) return;
    
    if (this.activeLotteries.size === 0) {
      await ctx.reply('🎁 Розыгрыши\n\nСписок активных розыгрышей пуст');
      return;
    }
    
    let message = '🎁 АКТИВНЫЕ РОЗЫГРЫШИ:\n\n';
    
    for (const [id, lottery] of this.activeLotteries) {
      const views = this.getViews(id);
      const participants = this.getParticipants(id);
      const ticketsCount = this.getTicketsCount(id);
      
      message += `🎁 ${lottery.title}\n`;
      message += `👁 Просмотров: ${views}\n`;
      message += `👥 Участников: ${participants}\n`;
      message += `🎫 Куплено билетов: ${ticketsCount}/${lottery.maxTickets}\n`;
      message += `📅 Окончание: ${lottery.endDate} в ${lottery.endTime}\n\n`;
    }
    
    await ctx.reply(message);
  }
  
  getViews(lotteryId) {
    return Array.from(this.views.values()).filter(v => v.lotteryId === lotteryId).length;
  }
  
  getParticipants(lotteryId) {
    const participants = new Set();
    Array.from(this.tickets.values())
      .filter(t => t.lotteryId === lotteryId)
      .forEach(t => participants.add(t.userId));
    return participants.size;
  }
  
  getTicketsCount(lotteryId) {
    return Array.from(this.tickets.values()).filter(t => t.lotteryId === lotteryId).length;
  }

  async showBalance(ctx) {
    if (!this.isAdmin(ctx)) return;
    await ctx.reply('💰 Баланс\n\nОбщий баланс системы: 0 руб.');
  }

  async findWinner(ctx) {
    if (!this.isAdmin(ctx)) return;
    await ctx.reply('🏆 Узнать победителя\n\nНет активных розыгрышей для определения победителя');
  }

  async startLotteryCreation(ctx) {
    if (!this.isAdmin(ctx)) return;
    
    this.lotteryCreation.set(ctx.from.id, { step: 'title' });
    await ctx.reply('➕ СОЗДАНИЕ РОЗЫГРЫША\n\nШаг 1/10: Введите название товара:');
  }

  async handleLotteryCreation(ctx) {
    if (!this.isAdmin(ctx)) return false;
    
    const creation = this.lotteryCreation.get(ctx.from.id);
    if (!creation) return false;

    const text = ctx.message.text;
    const photo = ctx.message.photo;

    switch (creation.step) {
      case 'title':
        if (!text) return false;
        creation.title = text;
        creation.step = 'price';
        await ctx.reply('Шаг 2/10: Введите стоимость билета (в рублях):');
        break;
        
      case 'price':
        if (!text || isNaN(text) || parseFloat(text) <= 0) {
          await ctx.reply('Ошибка! Введите корректную стоимость:');
          return true;
        }
        creation.price = parseFloat(text);
        creation.step = 'description';
        await ctx.reply('Шаг 3/10: Введите описание товара:');
        break;
        
      case 'description':
        if (!text) return false;
        creation.description = text;
        creation.step = 'link';
        await ctx.reply('Шаг 4/10: Введите ссылку на товар:');
        break;
        
      case 'link':
        if (!text) return false;
        creation.link = text;
        creation.step = 'photo';
        await ctx.reply('Шаг 5/10: Отправьте фото товара:');
        break;
        
      case 'photo':
        if (!photo || !photo.length) {
          await ctx.reply('Ошибка! Отправьте фото:');
          return true;
        }
        creation.photoId = photo[photo.length - 1].file_id;
        creation.step = 'tickets';
        await ctx.reply('Шаг 6/10: Введите количество билетов для начала розыгрыша:');
        break;
        
      case 'tickets':
        if (!text || isNaN(text) || parseInt(text) <= 0) {
          await ctx.reply('Ошибка! Введите корректное количество:');
          return true;
        }
        creation.maxTickets = parseInt(text);
        creation.step = 'date';
        await ctx.reply('Шаг 7/10: Введите дату публикации розыгрыша (формат: ДД.ММ.ГГГГ):');
        break;
        
      case 'date':
        if (!text || !/^\d{2}\.\d{2}\.\d{4}$/.test(text)) {
          await ctx.reply('Ошибка! Введите дату в формате ДД.ММ.ГГГГ:');
          return true;
        }
        creation.date = text;
        creation.step = 'time';
        await ctx.reply('Шаг 8/10: Введите время публикации розыгрыша (формат: ЧЧ:ММ):');
        break;
        
      case 'time':
        if (!text || !/^\d{2}:\d{2}$/.test(text)) {
          await ctx.reply('Ошибка! Введите время в формате ЧЧ:ММ:');
          return true;
        }
        creation.time = text;
        creation.step = 'endDate';
        await ctx.reply('Шаг 9/10: Введите дату окончания розыгрыша (формат: ДД.ММ.ГГГГ):');
        break;
        
      case 'endDate':
        if (!text || !/^\d{2}\.\d{2}\.\d{4}$/.test(text)) {
          await ctx.reply('Ошибка! Введите дату в формате ДД.ММ.ГГГГ:');
          return true;
        }
        creation.endDate = text;
        creation.step = 'endTime';
        await ctx.reply('Шаг 10/10: Введите время окончания розыгрыша (формат: ЧЧ:ММ):');
        break;
        
      case 'endTime':
        if (!text || !/^\d{2}:\d{2}$/.test(text)) {
          await ctx.reply('Ошибка! Введите время в формате ЧЧ:ММ:');
          return true;
        }
        creation.endTime = text;
        creation.step = 'complete';
        await this.showLotteryPreview(ctx, creation);
        break;
    }
    
    this.lotteryCreation.set(ctx.from.id, creation);
    return true;
  }

  async showLotteryPreview(ctx, lottery) {
    const message = `🎁 ${lottery.title}\n\n` +
      `💰 Стоимость билета: ${lottery.price} руб.\n` +
      `🎫 Куплено билетов: 0/${lottery.maxTickets}\n` +
      `📅 Окончание: ${lottery.endDate} в ${lottery.endTime}\n\n` +
      `📝 ${lottery.description}\n\n` +
      `🔗 ${lottery.link}`;

    const keyboard = Markup.keyboard([
      ['👁 Просмотреть'],
      ['✏️ Редактировать', '✅ Добавить']
    ]).resize();

    await ctx.replyWithPhoto(lottery.photoId, { caption: message, reply_markup: keyboard.reply_markup });
  }

  async previewLottery(ctx) {
    if (!this.isAdmin(ctx)) return;
    
    const creation = this.lotteryCreation.get(ctx.from.id);
    if (!creation) return;

    const message = `🎁 ${creation.title}\n\n` +
      `💰 Стоимость билета: ${creation.price} руб.\n` +
      `🎫 Куплено билетов: 0/${creation.maxTickets}\n` +
      `📅 Окончание: ${creation.endDate} в ${creation.endTime}\n\n` +
      `📝 ${creation.description}\n\n` +
      `🔗 ${creation.link}`;

    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('🎫 Купить билет', 'buy_ticket')]
    ]);

    await ctx.replyWithPhoto(creation.photoId, { caption: message, reply_markup: keyboard.reply_markup });
    await ctx.reply('👆 Так будет выглядеть карточка у пользователей');
  }

  async editLottery(ctx) {
    if (!this.isAdmin(ctx)) return;
    
    this.lotteryCreation.set(ctx.from.id, { step: 'title' });
    await ctx.reply('✏️ РЕДАКТИРОВАНИЕ\n\nШаг 1/10: Введите новое название товара:');
  }

  async saveLottery(ctx) {
    if (!this.isAdmin(ctx)) return;
    
    const creation = this.lotteryCreation.get(ctx.from.id);
    if (!creation) return;

    const lotteryId = Date.now();
    creation.id = lotteryId;
    
    // Сохраняем в активные розыгрыши
    this.activeLotteries.set(lotteryId, creation);
    
    // Устанавливаем таймер на окончание
    this.scheduleDrawing(creation);
    
    // Уведомляем всех подписчиков
    await this.notifyAllUsers(creation, ctx);
    
    this.lotteryCreation.delete(ctx.from.id);
    await this.showPanel(ctx);
  }
  
  scheduleDrawing(lottery) {
    const now = new Date();
    const [day, month, year] = lottery.endDate.split('.');
    const [hours, minutes] = lottery.endTime.split(':');
    const endDate = new Date(year, month - 1, day, hours, minutes);
    
    if (endDate > now) {
      setTimeout(() => {
        this.conductDrawing(lottery.id);
      }, endDate.getTime() - now.getTime());
    }
  }
  
  async conductDrawing(lotteryId) {
    const lottery = this.activeLotteries.get(lotteryId);
    if (!lottery) return;
    
    const lotteryTickets = Array.from(this.tickets.values()).filter(t => t.lotteryId === lotteryId);
    
    if (lotteryTickets.length === 0) {
      this.activeLotteries.delete(lotteryId);
      return;
    }
    
    // Выбираем случайный билет
    const winningTicket = lotteryTickets[Math.floor(Math.random() * lotteryTickets.length)];
    
    // Отправляем уведомление победителю
    await this.notifyWinner(winningTicket, lottery);
    
    // Удаляем розыгрыш из активных
    this.activeLotteries.delete(lotteryId);
  }
  
  async notifyWinner(ticket, lottery) {
    try {
      const message = `🎉 ПОЗДРАВЛЯЕМ!\n\nВы выиграли в розыгрыше!\n\n🎁 Приз: ${lottery.title}\n🎫 Выигрышный билет: ${ticket.id}\n\nСвяжитесь с администратором для получения приза!`;
      
      const imagePath = require('path').join(process.cwd(), 'images', 'pobeda.jpeg');
      
      if (require('fs').existsSync(imagePath)) {
        await this.bot.telegram.sendPhoto(ticket.userId, { source: imagePath }, { caption: message });
      } else {
        await this.bot.telegram.sendMessage(ticket.userId, message);
      }
    } catch (error) {
      console.error('Ошибка уведомления победителя:', error);
    }
  }
  
  async buyTicket(userId, lotteryId) {
    const lottery = this.activeLotteries.get(lotteryId);
    if (!lottery) return null;
    
    const ticketId = `T${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const ticket = {
      id: ticketId,
      lotteryId: lotteryId,
      userId: userId,
      price: lottery.price,
      createdAt: new Date()
    };
    
    this.tickets.set(ticketId, ticket);
    return ticket;
  }
  
  recordView(userId, lotteryId) {
    const viewId = `${userId}_${lotteryId}`;
    if (!this.views.has(viewId)) {
      this.views.set(viewId, { userId, lotteryId, createdAt: new Date() });
    }
  }

  async notifyAllUsers(lottery, ctx) {
    try {
      // Проверяем нужно ли отложить рассылку
      const now = new Date();
      const [day, month, year] = lottery.date.split('.');
      const [hours, minutes] = lottery.time.split(':');
      const scheduledDate = new Date(year, month - 1, day, hours, minutes);
      
      if (scheduledDate > now) {
        // Отложенная рассылка
        setTimeout(() => {
          this.sendLotteryToUsers(lottery);
        }, scheduledDate.getTime() - now.getTime());
        
        await ctx.reply(`✅ Розыгрыш запланирован на ${lottery.date} в ${lottery.time}`);
      } else {
        // Немедленная рассылка
        await this.sendLotteryToUsers(lottery);
        await ctx.reply('✅ Розыгрыш успешно добавлен!');
      }
    } catch (error) {
      console.error('Ошибка планирования:', error);
    }
  }

  async sendLotteryToUsers(lottery) {
    try {
      const users = await this.userService.getAllUsers();
      const message = `🎉 НОВЫЙ РОЗЫГРЫШ!\n\n🎁 ${lottery.title}\n\n💰 Стоимость билета: ${lottery.price} руб.\n🎫 Куплено билетов: 0/${lottery.maxTickets}\n📅 Окончание: ${lottery.endDate} в ${lottery.endTime}\n\n📝 ${lottery.description}\n\n🔗 ${lottery.link}`;
      
      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('🎫 Купить билет', `buy_ticket_${lottery.id}`)]
      ]);
      
      for (const user of users) {
        try {
          await this.bot.telegram.sendPhoto(user.telegramId, lottery.photoId, { 
            caption: message,
            reply_markup: keyboard.reply_markup
          });
          
          // Записываем просмотр
          this.recordView(user.telegramId, lottery.id);
        } catch (error) {
          // Пропускаем ошибки отправки
        }
      }
    } catch (error) {
      console.error('Ошибка рассылки:', error);
    }
  }

  async showPanel(ctx) {
    if (!this.isAdmin(ctx)) return;
    
    const keyboard = Markup.keyboard([
      ['➕ Добавить розыгрыш', '👥 Подписчики'],
      ['🎁 Розыгрыши', '✉ Рассылка'],
      ['🧪 Режим тестирования', '💰 Баланс'],
      ['🏆 Узнать победителя', '📊 Статистика']
    ]).resize();

    await ctx.reply('Админ-панель:', keyboard);
  }

  async showStats(ctx) {
    if (!this.isAdmin(ctx)) return;

    try {
      const stats = await this.userService.getStats();
      const message = `📊 Статистика бота:\n\n👥 Всего пользователей: ${stats.total}\n🆕 Новых сегодня: ${stats.today}`;
      await ctx.reply(message);
    } catch (error) {
      await ctx.reply('Ошибка получения статистики');
    }
  }

  async showUsers(ctx) {
    if (!this.isAdmin(ctx)) return;

    try {
      const users = await this.userService.getRecentUsers();
      
      if (users.length === 0) {
        await ctx.reply('Пользователей не найдено');
        return;
      }

      let message = '👥 Последние 20 пользователей:\n\n';
      users.forEach((user, index) => {
        const name = user.firstName || user.username || 'Неизвестный';
        const date = new Date(user.createdAt).toLocaleDateString('ru-RU');
        message += `${index + 1}. ${name}\nДата: ${date}\n\n`;
      });

      await ctx.reply(message);
    } catch (error) {
      await ctx.reply('Ошибка получения списка пользователей');
    }
  }

  async showSubscribers(ctx) {
    if (!this.isAdmin(ctx)) return;

    try {
      const users = await this.userService.getRecentUsers();
      const stats = await this.userService.getStats();
      
      if (users.length === 0) {
        await ctx.reply('Подписчиков не найдено');
        return;
      }

      let message = `👥 Подписчики (${stats.total}):\n\n`;
      
      users.forEach((user, index) => {
        const username = user.username ? `@${user.username}` : 'Нет ника';
        message += `${index + 1}. ${username}\n`;
      });

      await ctx.reply(message);
    } catch (error) {
      await ctx.reply('Ошибка получения списка подписчиков');
    }
  }
}

module.exports = AdminHandler;