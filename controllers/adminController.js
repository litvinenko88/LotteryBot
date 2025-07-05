const { Markup } = require("telegraf");
const userController = require("./userController");
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

  async backToMainMenu(ctx) {
    await userController.showMainMenu(ctx);
  },
};

module.exports = adminController;
