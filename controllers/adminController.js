const User = require("../models/User");
const { Markup } = require("telegraf");
const { ADMIN_ID } = require("../config/bot");

const getAdminMenuKeyboard = () => {
  return Markup.keyboard([
    ["🎁 Розыгрыш", "🎫 Мои билеты"],
    ["👥 Рефералы", "📜 История"],
    ["💰 Кошелек", "🛠 Админ-панель"],
    ["📊 Статистика", "✉ Рассылка"],
    ["🏆 Завершить розыгрыш", "👥 Список участников"],
  ]).resize();
};

module.exports = {
  async checkAdmin(ctx, next) {
    const user = await User.findOne({
      where: { telegramId: String(ctx.from.id) },
    });
    if (user?.isAdmin || String(ctx.from.id) === ADMIN_ID) {
      ctx.isAdmin = true;
      if (!user?.isAdmin && String(ctx.from.id) === ADMIN_ID) {
        await User.update(
          { isAdmin: true },
          { where: { telegramId: String(ctx.from.id) } }
        );
      }
    }
    return next();
  },

  async showAdminPanel(ctx) {
    if (!ctx.isAdmin) return;

    await ctx.reply(
      "Админ-панель:",
      Markup.keyboard([
        ["➕ Добавить розыгрыш", "👑 Добавить админа"],
        ["💰 Установить цену билета", "📊 Статистика"],
        ["✉ Сделать рассылку", "🏆 Завершить розыгрыш"],
        ["🔙 Главное меню"],
      ]).resize()
    );
  },

  async addRaffle(ctx) {
    if (!ctx.isAdmin) return;
    await ctx.reply(
      "Введите данные розыгрыша в формате:\nНазвание|Описание|Дата окончания|Цена билета"
    );
  },

  async endRaffle(ctx) {
    if (!ctx.isAdmin) return;
    // Логика завершения розыгрыша
    await ctx.reply("Розыгрыш завершен!", getAdminMenuKeyboard());
  },

  getAdminMenuKeyboard,
};
