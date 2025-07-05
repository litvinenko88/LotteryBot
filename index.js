const express = require("express");
const { Markup } = require("telegraf");
const bot = require("./config/bot");
const sequelize = require("./config/db");
const cache = require("./services/cache");
const User = require("./models/User");
const userController = require("./controllers/userController");
const menuController = require("./controllers/menuController");

const app = express();

// Middleware для проверки правил
bot.use(async (ctx, next) => {
  if (ctx.message?.text === "/start") return next();
  if (ctx.callbackQuery?.data === "show_rules") return next();
  if (ctx.callbackQuery?.data === "accept_rules") return next();
  if (ctx.message?.text === "🎁 Розыгрыш") return next();
  if (ctx.message?.text === "🎫 Мои билеты") return next();
  if (ctx.message?.text === "👥 Рефералы") return next();
  if (ctx.message?.text === "📜 История") return next();
  if (ctx.message?.text === "💰 Кошелек") return next();

  try {
    const user = await User.findOne({
      where: { telegramId: String(ctx.from.id) },
    });
    if (!user?.rulesAccepted) {
      return ctx.reply(
        "Пожалуйста, сначала ознакомьтесь с правилами и подтвердите их.",
        Markup.inlineKeyboard([
          Markup.button.callback("📜 Правила", "show_rules"),
        ])
      );
    }
  } catch (error) {
    console.error("Ошибка при проверке правил:", error);
    return ctx.reply("Произошла ошибка при проверке вашего статуса.");
  }

  return next();
});

// Обработчики команд
bot.start(userController.start);
bot.action("show_rules", userController.showRules);
bot.action("accept_rules", userController.acceptRules);

// Обработчики меню
bot.hears("🎁 Розыгрыш", menuController.raffle);
bot.hears("🎫 Мои билеты", menuController.myTickets);
bot.hears("👥 Рефералы", menuController.referrals);
bot.hears("📜 История", menuController.history);
bot.hears("💰 Кошелек", menuController.wallet);

// Запуск приложения
(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log("База данных подключена и синхронизирована");

    app.use(express.json());
    app.listen(3000, () => console.log("Express server running"));

    bot.launch();
    console.log("Бот запущен");
  } catch (error) {
    console.error("Ошибка при запуске:", error);
  }
})();

// Обработка завершения работы
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
