const userController = require("./userController");

module.exports = {
  raffle(ctx) {
    return ctx.reply(
      'Раздел "🎁 Розыгрыш" в разработке',
      userController.getMainMenuKeyboard()
    );
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
