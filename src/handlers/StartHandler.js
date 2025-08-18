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

  async showRules(ctx) {
    const rulesText = 'Правила участия в розыгрыше товаров с Wildberries и Ozon 🎉\n\n1. Участие в розыгрыше:\n   – Для участия в розыгрыше необходимо приобрести билет 🎫. Стоимость билета варьируется от 10 до 1500 рублей в зависимости от приза 💰. Один розыгрыш один билет\n\n2. Порядок покупки билета:\n   – Выберите приз, который хотите выиграть 🏆.\n   – Пополните кошелек через указанные способы оплаты 💳. Оплатите билет и участвуйте в розыгрыше\n\n3. Минимальное количество участников:\n   – Для проведения розыгрыша необходимо набрать определенное количество участников, установленное администратором 📊.\n   – Если нужное количество участников не набирается, по решению администратора розыгрыш может быть отменен или продолжен 🔄.\n\n4. Определение победителя:\n   – Если розыгрыш состоится, победитель будет случайным образом выбран среди участников, купивших билет на конкретный приз 🎉.\n   – Розыгрыш будет проводиться в установленное время ⏰, о чем будет объявлено заранее.\n\n5. Уведомление о выигрыше:\n   – После проведения розыгрыша победитель получит уведомление о выигрыше 📩.\n   – Для подтверждения выигрыша необходимо связаться с администратором и предоставить скриншот уведомления о победе 📸, а также номер своего билета.\n\n6. Получение приза:\n   – Приз будет отправлен на указанный пункт выдачи 📦 или, по желанию победителя, выплачен денежной суммой, равной стоимости товара 💵.\n   – Все детали получения приза будут согласованы с администратором 🤝.\n\n7. Возврат средств:\n   – В случае отмены розыгрыша деньги возвращаются участникам на кошелек в боте 💳. Участники могут вывести средства на карту или использовать их для участия в другом розыгрыше 🔄.\n\n8. Ответственность:\n   – Администрация не несет ответственности за неверно указанные данные при покупке билета и получении приза ⚠️.\n   – Участие в розыгрыше подразумевает согласие с данными правилами ✅.\n\n9. Изменения в правилах:\n   – Администрация оставляет за собой право вносить изменения в правила проведения розыгрыша 🔧. Все изменения будут опубликованы заранее 📢.';
    
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