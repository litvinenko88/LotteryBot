const { Markup } = require("telegraf");
const User = require("../models/User");
const { ADMIN_ID } = require("../config/bot");

const userController = {
  getMainKeyboard(isAdmin = false) {
    const mainButtons = [
      ["🎁 Розыгрыш", "🎫 Мои билеты"],
      ["👥 Рефералы", "📜 История"],
      ["💰 Кошелек"],
    ];

    if (isAdmin) {
      mainButtons.push(["🛠 Админ-панель"]);
    }

    return Markup.keyboard(mainButtons).resize();
  },

  async start(ctx) {
    try {
      const telegramId = String(ctx.from.id);
      const isAdmin = telegramId === ADMIN_ID;
      
      const [user, created] = await User.findOrCreate({
        where: { telegramId },
        defaults: {
          username: ctx.from.username || null,
          firstName: ctx.from.first_name || null,
          lastName: ctx.from.last_name || null,
          isAdmin,
        },
      });

      if (created) {
        console.log(`Новый пользователь зарегистрирован: ID ${telegramId}, имя: ${ctx.from.first_name}`);
        await ctx.reply(
          `Добро пожаловать, ${ctx.from.first_name || 'пользователь'}! 🎉\n\nВы успешно зарегистрированы в боте для участия в розыгрышах!`,
          userController.getMainKeyboard(isAdmin)
        );
      } else {
        console.log(`Пользователь вернулся: ID ${telegramId}`);
        await ctx.reply(
          `С возвращением, ${user.firstName || 'пользователь'}! 👋`,
          userController.getMainKeyboard(isAdmin)
        );
      }
    } catch (error) {
      console.error('Ошибка при обработке команды /start:', error);
      await ctx.reply('Произошла ошибка. Попробуйте позже.');
    }
  },

  async showMainMenu(ctx) {
    const isAdmin = String(ctx.from.id) === ADMIN_ID;
    await ctx.reply("Главное меню:", userController.getMainKeyboard(isAdmin));
  },
};

module.exports = userController;
