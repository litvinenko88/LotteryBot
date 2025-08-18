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
      
      const welcomeText = 'Привет! 🎉 Добро пожаловать в наш чат-бот, где мечты становятся реальностью! Здесь ты можешь участвовать в захватывающих розыгрышах товаров с Wildberries и Ozon. 🛍️✨ Просто следуй инструкциям, и, возможно, именно ты станешь счастливым обладателем крутого приза! Удачи! 🍀';
      
      const imagePath = path.join(process.cwd(), 'images', 'start.jpg');
      
      if (fs.existsSync(imagePath)) {
        try {
          await ctx.replyWithPhoto({ source: imagePath }, { caption: welcomeText });
        } catch (photoError) {
          await ctx.reply(welcomeText);
        }
      } else {
        await ctx.reply(welcomeText);
      }
      
      if (user.rulesAccepted) {
        await ctx.reply('Выберите действие:', this.getMainKeyboard(isAdmin));
      } else {
        await ctx.reply('Для продолжения ознакомьтесь с правилами:', this.getRulesKeyboard());
      }
    } catch (error) {
      await ctx.reply('Произошла ошибка. Попробуйте позже.');
    }
  }

  getRulesKeyboard() {
    return Markup.keyboard([['📜 Ознакомиться с правилами']]).resize();
  }

  getMainKeyboard(isAdmin = false) {
    if (isAdmin) {
      return Markup.keyboard([['🛠 Админ-панель']]).resize();
    }

    const buttons = [
      ['🎁 Розыгрыш', '🎫 Мои билеты'],
      ['👥 Рефералы', '📜 История'],
      ['💰 Кошелек']
    ];

    return Markup.keyboard(buttons).resize();
  }

  async showRules(ctx) {
    const rulesText = '**Правила участия в розыгрыше товаров Wildberries и Ozon** 🎉\n\n#### 1. Участие в розыгрыше\n- Для участия необходимо приобрести билет 🎫.\n- Стоимость билета зависит от приза и составляет от 10 до 1500 рублей 💰.\n- Один билет = один розыгрыш (участник может купить несколько билетов для увеличения шансов).\n\n#### 2. Как купить билет\n1. Выберите приз, который хотите выиграть 🏆.\n2. Пополните баланс в боте через доступные способы оплаты 💳.\n3. Оплатите билет и подтвердите участие.\n\n#### 3. Минимальное количество билетов\n- Для проведения розыгрыша необходимо набрать установленное число билетов 📊.\n- В боте отображается сколько билетов куплено и сколько осталось.\n- Если нужное количество билетов не набрано в течение 3 дней, розыгрыш отменяется, а средства возвращаются на баланс участников 🔄.\n- Администратор может продлить срок розыгрыша или отменить его.\n\n#### 4. Определение победителя\n- Победитель выбирается случайным образом среди купивших билеты на конкретный приз 🎲.\n- Розыгрыш проходит в заранее объявленное время ⏰.\n\n#### 5. Уведомление о выигрыше\n- Победитель получает уведомление в боте 📩.\n- Администратору автоматически передается:\n  - Номер выигрышного билета.\n  - Ваш ник для связи.\n- Для подтверждения победы необходимо:\n  - Предоставить скриншот билетов (для проверки).\n  - Ответить администратору в течение 24 часов.\n- Если победитель не отвечает, выбирается новый, а прежний участник уведомляется о причине отмены.\n\n#### 6. Получение приза\n- Приз отправляется на указанный пункт выдачи Wildberries/Ozon 📦.\n- По желанию победителя возможен денежный эквивалент стоимости товара 💵.\n- После доставки администратор высылает QR-код для бесплатного получения заказа.\n\n#### 7. Возврат средств\n- При отмене розыгрыша деньги возвращаются:\n  - На баланс в боте (для участия в других розыгрышах).\n  - Или по запросу — на карту 💳.\n\n#### 8. Ответственность\n- Участник самостоятельно отвечает за корректность указанных данных ⚠️.\n- Участие означает согласие с правилами ✅.\n\n#### 9. Изменения в правилах\n- Администрация вправе вносить изменения 🔧.\n- Все обновления публикуются заранее 📢.';
    
    const keyboard = Markup.keyboard([['✅ Я ознакомился с правилами']]).resize();
    
    await ctx.reply(rulesText, keyboard);
  }

  async acceptRules(ctx) {
    try {
      await this.userService.acceptRules(ctx.from.id);
      const user = await this.userService.getUser(ctx.from.id);
      const isAdmin = user.telegramId === config.ADMIN_ID;
      
      await ctx.reply('Спасибо! Теперь вы можете пользоваться всеми функциями бота! 🎉', this.getMainKeyboard(isAdmin));
    } catch (error) {
      await ctx.reply('Произошла ошибка. Попробуйте позже.');
    }
  }
}

module.exports = StartHandler;