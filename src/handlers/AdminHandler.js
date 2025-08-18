const { Markup } = require('telegraf');
const config = require('../config');

class AdminHandler {
  constructor(userService, bot) {
    this.userService = userService;
    this.bot = bot;
    this.lotteryCreation = new Map(); // Храним состояние создания розыгрыша
  }

  isAdmin(ctx) {
    return String(ctx.from.id) === config.ADMIN_ID;
  }

  async showLotteries(ctx) {
    if (!this.isAdmin(ctx)) return;
    await ctx.reply('🎁 Розыгрыши\n\nСписок активных розыгрышей пуст');
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
    await ctx.reply('➕ СОЗДАНИЕ РОЗЫГРЫША\n\nШаг 1/5: Введите название товара:');
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
        await ctx.reply('Шаг 2/5: Введите стоимость билета (в рублях):');
        break;
        
      case 'price':
        if (!text || isNaN(text) || parseFloat(text) <= 0) {
          await ctx.reply('Ошибка! Введите корректную стоимость:');
          return true;
        }
        creation.price = parseFloat(text);
        creation.step = 'description';
        await ctx.reply('Шаг 3/5: Введите описание товара:');
        break;
        
      case 'description':
        if (!text) return false;
        creation.description = text;
        creation.step = 'link';
        await ctx.reply('Шаг 4/5: Введите ссылку на товар:');
        break;
        
      case 'link':
        if (!text) return false;
        creation.link = text;
        creation.step = 'photo';
        await ctx.reply('Шаг 5/5: Отправьте фото товара:');
        break;
        
      case 'photo':
        if (!photo || !photo.length) {
          await ctx.reply('Ошибка! Отправьте фото:');
          return true;
        }
        creation.photoId = photo[photo.length - 1].file_id;
        creation.step = 'complete';
        await this.showLotteryPreview(ctx, creation);
        break;
    }
    
    this.lotteryCreation.set(ctx.from.id, creation);
    return true;
  }

  async showLotteryPreview(ctx, lottery) {
    const message = `🎁 ${lottery.title}\n\n` +
      `💰 Стоимость билета: ${lottery.price} руб.\n\n` +
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
      `👥 Участников: 0/100\n\n` +
      `📝 ${creation.description}\n\n` +
      `🔗 ${creation.link}\n\n` +
      `🎫 Купить билет`;

    await ctx.replyWithPhoto(creation.photoId, { caption: message });
    await ctx.reply('👆 Так будет выглядеть карточка у пользователей');
  }

  async editLottery(ctx) {
    if (!this.isAdmin(ctx)) return;
    
    this.lotteryCreation.set(ctx.from.id, { step: 'title' });
    await ctx.reply('✏️ РЕДАКТИРОВАНИЕ\n\nШаг 1/5: Введите новое название товара:');
  }

  async saveLottery(ctx) {
    if (!this.isAdmin(ctx)) return;
    
    const creation = this.lotteryCreation.get(ctx.from.id);
    if (!creation) return;

    // Сохраняем в базу (заглушка)
    const lotteryId = Date.now();
    
    await ctx.reply('✅ Розыгрыш успешно добавлен!');
    
    // Уведомляем всех подписчиков
    await this.notifyAllUsers(creation);
    
    this.lotteryCreation.delete(ctx.from.id);
    await this.showPanel(ctx);
  }

  async notifyAllUsers(lottery) {
    try {
      const users = await this.userService.getAllUsers();
      const message = `🎉 НОВЫЙ РОЗЫГРЫШ!\n\n🎁 ${lottery.title}\n💰 Стоимость билета: ${lottery.price} руб.\n\nПринимайте участие! 🎫`;
      
      for (const user of users) {
        try {
          await this.bot.telegram.sendPhoto(user.telegramId, lottery.photoId, { caption: message });
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