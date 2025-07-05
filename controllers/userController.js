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
    const isAdmin = String(ctx.from.id) === ADMIN_ID;
    const [user] = await User.findOrCreate({
      where: { telegramId: String(ctx.from.id) },
      defaults: {
        username: ctx.from.username,
        firstName: ctx.from.first_name,
        lastName: ctx.from.last_name,
        isAdmin,
      },
    });

    await ctx.reply(
      "Добро пожаловать!",
      userController.getMainKeyboard(isAdmin)
    );
  },

  async showMainMenu(ctx) {
    const isAdmin = String(ctx.from.id) === ADMIN_ID;
    await ctx.reply("Главное меню:", userController.getMainKeyboard(isAdmin));
  },
};

module.exports = userController;
