const userController = require("./userController");
const { ADMIN_ID } = require("../config/bot");

const menuController = {
  raffle(ctx) {
    const isAdmin = String(ctx.from.id) === ADMIN_ID;
    return ctx.reply(
      'Раздел "🎁 Розыгрыш"',
      userController.getMainKeyboard(isAdmin)
    );
  },

  myTickets(ctx) {
    const isAdmin = String(ctx.from.id) === ADMIN_ID;
    return ctx.reply(
      'Раздел "🎫 Мои билеты"',
      userController.getMainKeyboard(isAdmin)
    );
  },

  referrals(ctx) {
    const isAdmin = String(ctx.from.id) === ADMIN_ID;
    return ctx.reply(
      'Раздел "👥 Рефералы"',
      userController.getMainKeyboard(isAdmin)
    );
  },

  history(ctx) {
    const isAdmin = String(ctx.from.id) === ADMIN_ID;
    return ctx.reply(
      'Раздел "📜 История"',
      userController.getMainKeyboard(isAdmin)
    );
  },

  wallet(ctx) {
    const isAdmin = String(ctx.from.id) === ADMIN_ID;
    return ctx.reply(
      'Раздел "💰 Кошелек"',
      userController.getMainKeyboard(isAdmin)
    );
  },
};

module.exports = menuController;
