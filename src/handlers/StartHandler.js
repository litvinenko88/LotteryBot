const { Markup } = require('telegraf');
const { InputFile } = require('telegraf');
const path = require('path');
const config = require('../config');

class StartHandler {
  constructor(userService) {
    this.userService = userService;
  }

  async handle(ctx) {
    try {
      const { user, isNew } = await this.userService.createOrGetUser(ctx.from);
      const isAdmin = user.telegramId === config.ADMIN_ID;
      
      const keyboard = this.getMainKeyboard(isAdmin);
      const welcomeText = 'Привет! 🎉 Добро пожаловать в наш чат-бот, где мечты становятся реальностью! Здесь ты можешь участвовать в захватывающих розыгрышах товаров с Wildberries и Ozon. 🛍️✨ Просто следуй инструкциям, и, возможно, именно ты станешь счастливым обладателем крутого приза! Удачи! 🍀 Если у тебя есть вопросы, не стесняйся — я всегда на связи!';
      
      const imagePath = path.join(__dirname, '../../images/start.jpg');
      
      try {
        await ctx.replyWithPhoto(
          new InputFile(imagePath),
          {
            caption: welcomeText,
            reply_markup: keyboard.reply_markup
          }
        );
      } catch (photoError) {
        await ctx.reply(welcomeText, keyboard);
      }
    } catch (error) {
      await ctx.reply('Произошла ошибка. Попробуйте позже.');
    }
  }

  getMainKeyboard(isAdmin = false) {
    const buttons = [
      ['🎁 Розыгрыш', '🎫 Мои билеты'],
      ['👥 Рефералы', '📜 История'],
      ['💰 Кошелек']
    ];

    if (isAdmin) {
      buttons.push(['🛠 Админ-панель']);
    }

    return Markup.keyboard(buttons).resize();
  }
}

module.exports = StartHandler;