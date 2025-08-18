const { Op } = require('sequelize');
const logger = require('../utils/logger');

class UserService {
  constructor(userModel) {
    this.User = userModel;
  }

  async createOrGetUser(telegramUser) {
    try {
      const config = require('../config');
      const isAdmin = String(telegramUser.id) === config.ADMIN_ID;
      
      const [user, created] = await this.User.findOrCreate({
        where: { telegramId: String(telegramUser.id) },
        defaults: {
          username: telegramUser.username || null,
          firstName: telegramUser.first_name || null,
          lastName: telegramUser.last_name || null,
          isAdmin
        }
      });

      if (!created && isAdmin && !user.isAdmin) {
        await user.update({ isAdmin: true });
      }

      if (created) {
        logger.info(`Новый пользователь: ${logger.sanitize(telegramUser.id)}`);
      }

      return { user, isNew: created };
    } catch (error) {
      logger.error('Ошибка создания пользователя:', error);
      throw error;
    }
  }

  async getStats() {
    const total = await this.User.count();
    const today = await this.User.count({
      where: {
        createdAt: {
          [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });
    return { total, today };
  }

  async getRecentUsers(limit = 20) {
    return this.User.findAll({
      order: [['createdAt', 'DESC']],
      limit
    });
  }

  async acceptRules(telegramId) {
    await this.User.update(
      { rulesAccepted: true },
      { where: { telegramId: String(telegramId) } }
    );
  }

  async getUser(telegramId) {
    return this.User.findOne({ where: { telegramId: String(telegramId) } });
  }

  async getAllUsers() {
    return await this.User.findAll({
      where: { rulesAccepted: true }
    });
  }
}

module.exports = UserService;