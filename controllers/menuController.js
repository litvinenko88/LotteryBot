const userController = require("./userController");
const adminController = require("./adminController");

module.exports = {
  raffle(ctx) {
    const keyboard = ctx.isAdmin
      ? adminController.getAdminMenuKeyboard()
      : userController.getMainMenuKeyboard();
    return ctx.reply('Раздел "🎁 Розыгрыш"', keyboard);
  },

  myTickets(ctx) {
    return ctx.reply(
      'Раздел "🎫 Мои билеты" в разработке',
      userController.getMainMenuKeyboard()
    );
  },

  referrals(ctx) {
    return ctx.reply(
      'Раздел "👥 Рефералы" в разработке',
      userController.getMainMenuKeyboard()
    );
  },

  history(ctx) {
    return ctx.reply(
      'Раздел "📜 История" в разработке',
      userController.getMainMenuKeyboard()
    );
  },

  wallet(ctx) {
    return ctx.reply(
      'Раздел "💰 Кошелек" в разработке',
      userController.getMainMenuKeyboard()
    );
  },
};
