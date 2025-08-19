const { Markup } = require('telegraf');

class ReferralService {
  constructor(userService, walletService) {
    this.userService = userService;
    this.walletService = walletService;
    this.referrals = new Map(); // userId -> [referredUserIds]
    this.referralBonus = 50; // Бонус за реферала
  }

  async processReferral(newUserId, referrerId) {
    if (!referrerId || newUserId === referrerId) return false;

    // Проверяем что реферер существует
    const referrer = await this.userService.getUser(referrerId);
    if (!referrer) return false;

    // Добавляем реферала
    if (!this.referrals.has(referrerId)) {
      this.referrals.set(referrerId, []);
    }
    
    const referredUsers = this.referrals.get(referrerId);
    if (!referredUsers.includes(newUserId)) {
      referredUsers.push(newUserId);
      
      // Начисляем бонус рефереру
      await this.walletService.addBalance(referrerId, this.referralBonus, 'Реферальный бонус');
      
      return true;
    }
    
    return false;
  }

  getReferralCount(userId) {
    return this.referrals.get(userId)?.length || 0;
  }

  getReferralEarnings(userId) {
    return this.getReferralCount(userId) * this.referralBonus;
  }

  async showReferrals(ctx) {
    const referralLink = `https://t.me/your_bot?start=ref_${ctx.from.id}`;
    const referralsCount = this.getReferralCount(ctx.from.id);
    const referralBonus = this.getReferralEarnings(ctx.from.id);

    const message = `👥 РЕФЕРАЛЬНАЯ СИСТЕМА\n\n` +
      `🔗 Ваша ссылка:\n${referralLink}\n\n` +
      `👥 Приглашено: ${referralsCount} человек\n` +
      `💰 Заработано: ${referralBonus} руб.\n\n` +
      `💡 За каждого приглашенного друга вы получаете ${this.referralBonus} рублей на баланс!`;

    const keyboard = Markup.keyboard([
      ['📤 Поделиться ссылкой'],
      ['🔙 Главное меню']
    ]).resize();

    await ctx.reply(message, keyboard);
  }

  async shareReferralLink(ctx) {
    const referralLink = `https://t.me/your_bot?start=ref_${ctx.from.id}`;
    
    await ctx.reply(`📤 Поделитесь этой ссылкой с друзьями:\n\n${referralLink}\n\n💰 За каждого друга вы получите ${this.referralBonus} рублей!`);
  }
}

module.exports = ReferralService;