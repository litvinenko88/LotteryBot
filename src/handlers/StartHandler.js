const { Markup } = require('telegraf');
const { InputFile } = require('telegraf');
const path = require('path');
const fs = require('fs');
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
      const welcomeText = 'Привет! 🎉 Добро пожаловать в наш чат-бот, где мечты становятся реальностью! Здесь ты можешь участвовать в захватывающих розыгрышах товаров с Wildberries и Ozon. 🛍️✨ Просто следуй инструкциям, и, возможно, именно ты станешь счастливым обладателем крутого приза! Удачи! 🍀';
      
      const imagePath = path.join(process.cwd(), 'images', 'start.jpg');
      console.log('Путь к изображению:', imagePath);
      console.log('Файл существует:', fs.existsSync(imagePath));
      
      if (fs.existsSync(imagePath)) {
        try {
          await ctx.replyWithPhoto(
            { source: imagePath },
            {
              caption: welcomeText,
              reply_markup: keyboard.reply_markup
            }
          );
        } catch (photoError) {
          console.log('Ошибка отправки фото:', photoError);
          await ctx.reply(welcomeText, keyboard);
        }
      } else {
        console.log('Файл не найден:', imagePath);
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