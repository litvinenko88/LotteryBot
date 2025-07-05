require("dotenv").config();
const { Telegraf } = require("telegraf");

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || "YOUR_BOT_TOKEN");
const ADMIN_ID = "682859146"; // ID главного администратора

module.exports = { bot, ADMIN_ID };
