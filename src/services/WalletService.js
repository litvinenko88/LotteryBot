const { Markup } = require('telegraf');

class WalletService {
  constructor(userService) {
    this.userService = userService;
    this.transactions = new Map(); // История транзакций
  }

  async getBalance(userId) {
    const user = await this.userService.getUser(userId);
    return user ? parseFloat(user.balance) || 0 : 0;
  }

  async addBalance(userId, amount, description = 'Пополнение') {
    const user = await this.userService.getUser(userId);
    if (!user) return false;

    const newBalance = parseFloat(user.balance || 0) + parseFloat(amount);
    await this.userService.updateBalance(userId, newBalance);
    
    this.addTransaction(userId, amount, 'income', description);
    return newBalance;
  }

  async deductBalance(userId, amount, description = 'Покупка билета') {
    const user = await this.userService.getUser(userId);
    if (!user) return false;

    const currentBalance = parseFloat(user.balance || 0);
    if (currentBalance < amount) return false;

    const newBalance = currentBalance - parseFloat(amount);
    await this.userService.updateBalance(userId, newBalance);
    
    this.addTransaction(userId, -amount, 'expense', description);
    return newBalance;
  }

  addTransaction(userId, amount, type, description) {
    const transactionId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    this.transactions.set(transactionId, {
      id: transactionId,
      userId: userId,
      amount: amount,
      type: type,
      description: description,
      date: new Date()
    });
  }

  getTransactions(userId) {
    return Array.from(this.transactions.values())
      .filter(t => t.userId === userId)
      .sort((a, b) => b.date - a.date)
      .slice(0, 10);
  }

  async showWallet(ctx) {
    const balance = await this.getBalance(ctx.from.id);
    
    const message = `💰 ВАШ КОШЕЛЕК\n\n💳 Баланс: ${balance} руб.\n\n💡 Пополните кошелек для участия в розыгрышах`;
    
    const keyboard = Markup.keyboard([
      ['💳 Пополнить кошелек', '📊 История операций'],
      ['🔙 Главное меню']
    ]).resize();

    await ctx.reply(message, keyboard);
  }

  async showTopUp(ctx) {
    const keyboard = Markup.keyboard([
      ['💳 Банковская карта', '📱 СБП'],
      ['🪙 Криптовалюта', '💸 Другие способы'],
      ['🔙 Назад к кошельку']
    ]).resize();

    await ctx.reply('💳 ПОПОЛНЕНИЕ КОШЕЛЬКА\n\nВыберите способ пополнения:', keyboard);
  }

  async showTransactionHistory(ctx) {
    const transactions = this.getTransactions(ctx.from.id);
    
    if (transactions.length === 0) {
      const keyboard = Markup.keyboard([['🔙 Назад к кошельку']]).resize();
      return ctx.reply('📊 История операций пуста', keyboard);
    }

    let message = '📊 ИСТОРИЯ ОПЕРАЦИЙ\n\n';
    transactions.forEach((t, index) => {
      const sign = t.amount > 0 ? '+' : '';
      const emoji = t.amount > 0 ? '💚' : '💸';
      message += `${emoji} ${sign}${t.amount} руб.\n`;
      message += `📝 ${t.description}\n`;
      message += `📅 ${t.date.toLocaleDateString('ru-RU')}\n\n`;
    });

    const keyboard = Markup.keyboard([['🔙 Назад к кошельку']]).resize();
    await ctx.reply(message, keyboard);
  }
}

module.exports = WalletService;