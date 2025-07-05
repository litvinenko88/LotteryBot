const { Telegraf } = require("telegraf");
require("dotenv").config();

const bot = new Telegraf(
  process.env.TELEGRAM_BOT_TOKEN ||
    "8195461357:AAHe47zs4vpz703xbnLxfqwY1Nv8oZEQQPc"
);

module.exports = bot;
