const express = require("express");
const { bot, ADMIN_ID } = require("./config/bot");
const sequelize = require("./config/db");
const User = require("./models/User");
const userController = require("./controllers/userController");
const menuController = require("./controllers/menuController");
const adminController = require("./controllers/adminController");

const app = express();

// Middleware для проверки прав администратора
bot.use(async (ctx, next) => {
  ctx.isAdmin = String(ctx.from.id) === ADMIN_ID;
  return next();
});

// Обработчики команд
bot.start(userController.start);

// Основное меню
bot.hears("🎁 Розыгрыш", menuController.raffle);
bot.hears("🎫 Мои билеты", menuController.myTickets);
bot.hears("👥 Рефералы", menuController.referrals);
bot.hears("📜 История", menuController.history);
bot.hears("💰 Кошелек", menuController.wallet);

// Админ-меню
bot.hears("🛠 Админ-панель", adminController.showAdminPanel);
bot.hears("📊 Статистика", adminController.showStats);
bot.hears("👥 Список участников", adminController.showUsers);
bot.hears("🔙 Главное меню", adminController.backToMainMenu);

// Инициализация базы данных
(async () => {
  try {
    await sequelize.sync();

    // Создаем главного администратора
    await User.findOrCreate({
      where: { telegramId: ADMIN_ID },
      defaults: {
        username: "admin",
        firstName: "Admin",
        lastName: "Bot",
        rulesAccepted: true,
        isAdmin: true,
      },
    });

    console.log("База данных готова");
    console.log(`Администратор: ${ADMIN_ID}`);

    app.use(express.json());
    app.listen(3000, () => console.log("Сервер запущен"));

    bot.launch();
    console.log("Бот запущен");
  } catch (error) {
    console.error("Ошибка запуска:", error);
  }
})();

// Обработка завершения работы
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
