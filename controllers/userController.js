const User = require("../models/User");
const { Markup } = require("telegraf");
const adminController = require("./adminController");

const getMainMenuKeyboard = (isAdmin = false) => {
  if (isAdmin) {
    return adminController.getAdminMenuKeyboard();
  }

  return Markup.keyboard([
    ["🎁 Розыгрыш", "🎫 Мои билеты"],
    ["👥 Рефералы", "📜 История"],
    ["💰 Кошелек"],
  ]).resize();
};

module.exports = {
  async start(ctx) {
    const [user] = await User.findOrCreate({
      where: { telegramId: String(ctx.from.id) },
      defaults: {
        username: ctx.from.username,
        firstName: ctx.from.first_name,
        lastName: ctx.from.last_name,
      },
    });

    await ctx.reply(
      "Добро пожаловать! Здесь будет ваш текст приветствия.",
      Markup.inlineKeyboard([
        Markup.button.callback("📜 Правила", "show_rules"),
      ])
    );
    if (isAdmin) {
      await ctx.reply("Вы вошли как администратор.", getMainMenuKeyboard(true));
    }
  },

  async showRules(ctx) {
    await ctx.reply(
      "Здесь будут ваши правила. Оставьте место для текста.\n\nПожалуйста, ознакомьтесь и подтвердите:",
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "✅ Ознакомился", callback_data: "accept_rules" }],
          ],
        },
      }
    );
  },

  async acceptRules(ctx) {
    try {
      await User.update(
        { rulesAccepted: true },
        { where: { telegramId: String(ctx.from.id) } }
      );

      await ctx.reply(
        "Спасибо! Вы успешно подтвердили правила. Теперь вы можете пользоваться ботом.",
        getMainMenuKeyboard()
      );
    } catch (error) {
      console.error("Ошибка при подтверждении правил:", error);
      await ctx.reply("Произошла ошибка при обработке вашего подтверждения.");
    }
  },

  getMainMenuKeyboard,
};
