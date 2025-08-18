const { Markup } = require("telegraf");
const userController = require("./userController");
const User = require("../models/User");
const { ADMIN_ID } = require("../config/bot");

const adminController = {
  getAdminKeyboard() {
    return Markup.keyboard([
      ["➕ Добавить розыгрыш", "🏆 Завершить розыгрыш"],
      ["💰 Установить цену", "📊 Статистика"],
      ["✉ Рассылка", "👥 Список участников"],
      ["🔙 Главное меню"],
    ]).resize();
  },

  async showAdminPanel(ctx) {
    if (String(ctx.from.id) !== ADMIN_ID) return;
    await ctx.reply("Админ-панель:", adminController.getAdminKeyboard());
  },

  async showStats(ctx) {
    if (String(ctx.from.id) !== ADMIN_ID) return;
    
    try {
      const totalUsers = await User.count();
      const todayUsers = await User.count({
        where: {
          createdAt: {
            [require('sequelize').Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      });
      
      const statsMessage = `📊 Статистика бота:\n\n👥 Всего пользователей: ${totalUsers}\n🎆 Новых сегодня: ${todayUsers}`;
      
      await ctx.reply(statsMessage, adminController.getAdminKeyboard());
    } catch (error) {
      console.error('Ошибка получения статистики:', error);
      await ctx.reply('Ошибка получения статистики');
    }
  },

  async showUsers(ctx) {
    if (String(ctx.from.id) !== ADMIN_ID) return;
    
    try {
      const users = await User.findAll({
        order: [['createdAt', 'DESC']],
        limit: 20
      });
      
      if (users.length === 0) {
        await ctx.reply('Пользователей не найдено', adminController.getAdminKeyboard());
        return;
      }
      
      let usersList = '👥 Последние 20 пользователей:\n\n';
      
      users.forEach((user, index) => {
        const name = user.firstName || user.username || 'Неизвестный';
        const date = new Date(user.createdAt).toLocaleDateString('ru-RU');
        usersList += `${index + 1}. ${name} (ID: ${user.telegramId})\nДата: ${date}\n\n`;
      });
      
      await ctx.reply(usersList, adminController.getAdminKeyboard());
    } catch (error) {
      console.error('Ошибка получения списка пользователей:', error);
      await ctx.reply('Ошибка получения списка пользователей');
    }
  },

  async backToMainMenu(ctx) {
    await userController.showMainMenu(ctx);
  },
};

module.exports = adminController;
