const { Markup } = require('telegraf');
const config = require('../config');

class TestHandler {
  constructor(userService, startHandler, adminHandler) {
    this.userService = userService;
    this.startHandler = startHandler;
    this.adminHandler = adminHandler;
    this.testMode = new Map(); // Хранит состояние тестового режима для каждого админа
  }

  isAdmin(ctx) {
    return String(ctx.from.id) === config.ADMIN_ID;
  }

  async showTestPanel(ctx) {
    if (!this.isAdmin(ctx)) return;
    
    const keyboard = Markup.keyboard([
      ['🧪 Тест как новый пользователь', '🧪 Тест как старый пользователь'],
      ['🧪 Показать все кнопки пользователя', '🧪 Показать все админ кнопки'],
      ['🧪 Симуляция полного процесса', '🧪 Тест системы розыгрышей'],
      ['🔙 Назад в админ-панель']
    ]).resize();

    await ctx.reply('🧪 РЕЖИМ ТЕСТИРОВАНИЯ\\n\\nВыберите что хотите протестировать:', keyboard);
  }

  async testAsNewUser(ctx) {
    if (!this.isAdmin(ctx)) return;
    
    this.testMode.set(ctx.from.id, 'new_user');
    
    await ctx.reply('🧪 ТЕСТ: Симуляция нового пользователя\\n\\n' +
      'Сейчас вы увидите то же, что видит новый пользователь при первом запуске /start');
    
    // Симулируем новый пользователь
    const mockUser = {
      telegramId: 999999999, // Фейковый ID
      firstName: 'Тестовый',
      username: 'test_user',
      rulesAccepted: false,
      createdAt: new Date()
    };
    
    const welcomeText = 'Привет! 🎉 Добро пожаловать в наш чат-бот, где мечты становятся реальностью! Здесь ты можешь участвовать в захватывающих розыгрышах товаров с Wildberries и Ozon. 🛍️✨ Просто следуй инструкциям, и, возможно, именно ты станешь счастливым обладателем крутого приза! Удачи! 🍀';
    
    await ctx.reply('📱 ЭКРАН ПОЛЬЗОВАТЕЛЯ:\\n\\n' + welcomeText);
    await ctx.reply('🔘 КНОПКИ КОТОРЫЕ ВИДИТ НОВЫЙ ПОЛЬЗОВАТЕЛЬ:', this.startHandler.getRulesKeyboard());
    
    await ctx.reply('\\n🧪 Нажмите "📜 Ознакомиться с правилами" чтобы продолжить тест');
  }

  async testAsOldUser(ctx) {
    if (!this.isAdmin(ctx)) return;
    
    this.testMode.set(ctx.from.id, 'old_user');
    
    await ctx.reply('🧪 ТЕСТ: Симуляция существующего пользователя\\n\\n' +
      'Сейчас вы увидите то же, что видит пользователь который уже принял правила');
    
    const welcomeText = 'С возвращением! 👋';
    
    await ctx.reply('📱 ЭКРАН ПОЛЬЗОВАТЕЛЯ:\\n\\n' + welcomeText);
    await ctx.reply('🔘 КНОПКИ КОТОРЫЕ ВИДИТ ПОЛЬЗОВАТЕЛЬ:', this.startHandler.getMainKeyboard(false));
    
    await ctx.reply('\\n🧪 Теперь можете нажимать на любые кнопки чтобы увидеть что происходит');
  }

  async testWithoutRules(ctx) {
    if (!this.isAdmin(ctx)) return;
    
    await ctx.reply('🧪 ТЕСТ: Пользователь без принятых правил\\n\\n' +
      'Если пользователь попытается нажать основные кнопки без принятия правил:');
    
    await ctx.reply('📱 ОТВЕТ БОТА:\\n"Сначала ознакомьтесь с правилами!"');
    await ctx.reply('🔘 ДОСТУПНЫЕ КНОПКИ:', this.startHandler.getRulesKeyboard());
  }

  async testWithRules(ctx) {
    if (!this.isAdmin(ctx)) return;
    
    await ctx.reply('🧪 ТЕСТ: Пользователь с принятыми правилами\\n\\n' +
      'После принятия правил пользователь видит:');
    
    await ctx.reply('📱 ОТВЕТ БОТА:\\n"Спасибо! Теперь вы можете пользоваться всеми функциями бота! 🎉"');
    await ctx.reply('🔘 ДОСТУПНЫЕ КНОПКИ:', this.startHandler.getMainKeyboard(false));
  }

  async showAllUserButtons(ctx) {
    if (!this.isAdmin(ctx)) return;
    
    await ctx.reply('🧪 ВСЕ КНОПКИ ОБЫЧНОГО ПОЛЬЗОВАТЕЛЯ:\\n\\n' +
      '1️⃣ Кнопки для нового пользователя:');
    await ctx.reply('🔘', this.startHandler.getRulesKeyboard());
    
    await ctx.reply('\\n2️⃣ Кнопки после принятия правил:');
    await ctx.reply('🔘', this.startHandler.getMainKeyboard(false));
    
    await ctx.reply('\\n📝 ОПИСАНИЕ КНОПОК:\\n' +
      '🎁 Розыгрыш - просмотр активных розыгрышей\\n' +
      '🎫 Мои билеты - купленные билеты\\n' +
      '👥 Рефералы - реферальная система\\n' +
      '📜 История - история участия\\n' +
      '💰 Кошелек - баланс и пополнение');
  }

  async showAllAdminButtons(ctx) {
    if (!this.isAdmin(ctx)) return;
    
    await ctx.reply('🧪 ВСЕ КНОПКИ АДМИНИСТРАТОРА:\\n\\n' +
      '1️⃣ Главное меню админа:');
    await ctx.reply('🔘', this.startHandler.getMainKeyboard(true));
    
    await ctx.reply('\\n2️⃣ Админ-панель:');
    const adminKeyboard = Markup.keyboard([
      ['📊 Статистика', '👥 Подписчики'],
      ['➕ Добавить розыгрыш', '🏆 Завершить розыгрыш'],
      ['💰 Установить цену', '✉ Рассылка'],
      ['🧪 Режим тестирования'],
      ['🔙 Главное меню']
    ]).resize();
    await ctx.reply('🔘', adminKeyboard);
    
    await ctx.reply('\\n📝 ОПИСАНИЕ АДМИН КНОПОК:\\n' +
      '📊 Статистика - количество пользователей\\n' +
      '👥 Подписчики - список пользователей\\n' +
      '➕ Добавить розыгрыш - создание нового розыгрыша\\n' +
      '🏆 Завершить розыгрыш - завершение активного розыгрыша\\n' +
      '💰 Установить цену - настройка цен билетов\\n' +
      '✉ Рассылка - отправка сообщений всем пользователям\\n' +
      '🧪 Режим тестирования - этот режим');
  }

  async simulateFullProcess(ctx) {
    if (!this.isAdmin(ctx)) return;
    
    await ctx.reply('🧪 ПОЛНАЯ СИМУЛЯЦИЯ ПРОЦЕССА ПОЛЬЗОВАТЕЛЯ\\n\\n' +
      'Сейчас вы увидите весь путь пользователя от начала до конца:');
    
    // Шаг 1
    await new Promise(resolve => setTimeout(resolve, 1000));
    await ctx.reply('1️⃣ НОВЫЙ ПОЛЬЗОВАТЕЛЬ НАЖИМАЕТ /start');
    
    // Шаг 2
    await new Promise(resolve => setTimeout(resolve, 1500));
    await ctx.reply('2️⃣ ПОЛУЧАЕТ ПРИВЕТСТВИЕ И КНОПКУ ПРАВИЛ:', this.startHandler.getRulesKeyboard());
    
    // Шаг 3
    await new Promise(resolve => setTimeout(resolve, 1500));
    await ctx.reply('3️⃣ НАЖИМАЕТ "📜 Ознакомиться с правилами"');
    
    // Шаг 4
    await new Promise(resolve => setTimeout(resolve, 1500));
    await ctx.reply('4️⃣ ВИДИТ ТЕКСТ ПРАВИЛ И КНОПКУ ПРИНЯТИЯ');
    const rulesKeyboard = Markup.keyboard([['✅ Я ознакомился с правилами']]).resize();
    await ctx.reply('🔘', rulesKeyboard);
    
    // Шаг 5
    await new Promise(resolve => setTimeout(resolve, 1500));
    await ctx.reply('5️⃣ ПРИНИМАЕТ ПРАВИЛА');
    
    // Шаг 6
    await new Promise(resolve => setTimeout(resolve, 1500));
    await ctx.reply('6️⃣ ПОЛУЧАЕТ ДОСТУП К ОСНОВНОМУ МЕНЮ:', this.startHandler.getMainKeyboard(false));
    
    // Шаг 7
    await new Promise(resolve => setTimeout(resolve, 1500));
    await ctx.reply('7️⃣ МОЖЕТ ИСПОЛЬЗОВАТЬ ВСЕ ФУНКЦИИ БОТА\\n\\n' +
      '✅ Симуляция завершена! Теперь вы можете тестировать любые кнопки.');
  }

  async handleTestModeMessage(ctx) {
    if (!this.isAdmin(ctx)) return false;
    
    const mode = this.testMode.get(ctx.from.id);
    if (!mode) return false;
    
    const text = ctx.message.text;
    
    // Обработка тестовых сценариев
    if (text === '📜 Ознакомиться с правилами') {
      await this.startHandler.showRules(ctx);
      await ctx.reply('\\n🧪 ТЕСТ: Пользователь увидел правила. Теперь нажмите "✅ Я ознакомился с правилами"');
      return true;
    }
    
    if (text === '✅ Я ознакомился с правилами') {
      await ctx.reply('📱 ОТВЕТ БОТА:\\n"Спасибо! Теперь вы можете пользоваться всеми функциями бота! 🎉"');
      await ctx.reply('🔘 НОВЫЕ КНОПКИ:', this.startHandler.getMainKeyboard(false));
      await ctx.reply('\\n🧪 ТЕСТ: Пользователь принял правила и получил доступ к основному меню');
      return true;
    }
    
    // Тестирование основных кнопок
    if (['🎁 Розыгрыш', '🎫 Мои билеты', '👥 Рефералы', '📜 История', '💰 Кошелек'].includes(text)) {
      await ctx.reply(`📱 ОТВЕТ БОТА:\\n"Раздел \\"${text}\\" в разработке"`);
      await ctx.reply(`\\n🧪 ТЕСТ: Пользователь нажал "${text}" и получил сообщение о разработке`);
      return true;
    }
    
    return false;
  }

  async testLotterySystem(ctx) {
    if (!this.isAdmin(ctx)) return;
    
    await ctx.reply('🧪 ТЕСТ СИСТЕМЫ РОЗЫГРЫШЕЙ\n\n' +
      'Для тестирования системы розыгрышей:\n\n' +
      '1. Создайте розыгрыш через "➕ Добавить розыгрыш"\n' +
      '2. Проверьте статистику в "🎁 Розыгрыши"\n' +
      '3. Купите билеты нажав кнопку под карточкой\n' +
      '4. Проверьте обновленную статистику\n' +
      '5. Дождитесь автоматического розыгрыша');
  }

  async exitTestMode(ctx) {
    if (!this.isAdmin(ctx)) return;
    
    this.testMode.delete(ctx.from.id);
    await this.adminHandler.showPanel(ctx);
    await ctx.reply('🧪 Режим тестирования завершен. Вы вернулись в админ-панель.');
  }
}

module.exports = TestHandler;