const { Markup } = require('telegraf');
const config = require('../config');

class AdminHandler {
  constructor(userService) {
    this.userService = userService;
  }

  isAdmin(ctx) {
    return String(ctx.from.id) === config.ADMIN_ID;
  }

  async showPanel(ctx) {
    if (!this.isAdmin(ctx)) return;
    
    const keyboard = Markup.keyboard([
      ['📊 Статистика', '👥 Подписчики'],
      ['➕ Добавить розыгрыш', '🏆 Завершить розыгрыш'],
      ['💰 Установить цену', '✉ Рассылка'],
      ['🔙 Главное меню']
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
        const name = user.firstName || 'Неизвестный';
        const username = user.username ? `@${user.username}` : 'Нет ника';
        const date = new Date(user.createdAt).toLocaleDateString('ru-RU');
        
        message += `${index + 1}. ${name}\n${username}\nДата: ${date}\n\n`;
      });

      await ctx.reply(message);
    } catch (error) {
      await ctx.reply('Ошибка получения списка подписчиков');
    }
  }
}

module.exports = AdminHandler;