const config = require('../config');
const logger = require('../utils/logger');

class DatabaseService {
  constructor(sequelize) {
    this.sequelize = sequelize;
    this.models = {};
  }

  async init() {
    try {
      this.models.User = require('../models/User')(this.sequelize);
      
      await this.sequelize.sync();
      await this.createAdmin();
      
      logger.info('База данных инициализирована');
    } catch (error) {
      logger.error('Ошибка инициализации БД:', error);
      throw error;
    }
  }

  async createAdmin() {
    const [admin, created] = await this.models.User.findOrCreate({
      where: { telegramId: config.ADMIN_ID },
      defaults: {
        username: 'admin',
        firstName: 'Admin',
        isAdmin: true,
        rulesAccepted: false
      }
    });
    
    if (!admin.isAdmin) {
      await admin.update({ isAdmin: true });
    }
    
    logger.info(`Админ ${created ? 'создан' : 'обновлен'}: ${logger.sanitize(admin.telegramId)}`);
  }

  getModel(name) {
    return this.models[name];
  }
}

module.exports = DatabaseService;