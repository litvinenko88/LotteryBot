require('dotenv').config();

module.exports = {
  BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  ADMIN_ID: process.env.ADMIN_ID || '682859146',
  DATABASE: {
    dialect: 'sqlite',
    storage: 'database.sqlite',
    logging: false
  },
  LOG_LEVEL: process.env.LOG_LEVEL || 'info'
};