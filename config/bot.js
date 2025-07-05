require("dotenv").config();
const { Telegraf } = require("telegraf");

const bot = new Telegraf(
  process.env.TELEGRAM_BOT_TOKEN ||
    "8195461357:AAHe47zs4vpz703xbnLxfqwY1Nv8oZEQQPc"
);
const ADMIN_ID = "682859146"; // Главный администратор

module.exports = { bot, ADMIN_ID };
