const { Markup } = require('telegraf');
const config = require('../config');

class StartHandler {
  constructor(userService) {
    this.userService = userService;
  }

  async handle(ctx) {
    try {
      const { user, isNew } = await this.userService.createOrGetUser(ctx.from);
      const isAdmin = user.telegramId === config.ADMIN_ID;
      
      const keyboard = this.getMainKeyboard(isAdmin);
      
      if (isNew) {
        await ctx.reply(
          `Добро пожаловать, ${ctx.from.first_name || 'пользователь'}! 🎉\n\nВы зарегистрированы в боте для участия в розыгрышах!`,
          keyboard
        );
      } else {
        await ctx.reply(
          `С возвращением, ${user.firstName || 'пользователь'}! 👋`,
          keyboard
        );
      }
    } catch (error) {
      await ctx.reply('Произошла ошибка. Попробуйте позже.');
    }
  }

  getMainKeyboard(isAdmin = false) {
    const buttons = [
      ['🎁 Розыгрыш', '🎫 Мои билеты'],
      ['👥 Рефералы', '📜 История'],
      ['💰 Кошелек']
    ];

    if (isAdmin) {
      buttons.push(['🛠 Админ-панель']);
    }

    return Markup.keyboard(buttons).resize();
  }
}

module.exports = StartHandler;