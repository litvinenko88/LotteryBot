const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const UserAction = require("./UserAction");

const User = sequelize.define("User", {
  telegramId: { type: DataTypes.STRING, unique: true },
  username: DataTypes.STRING,
  firstName: DataTypes.STRING,
  lastName: DataTypes.STRING,
  rulesAccepted: { type: DataTypes.BOOLEAN, defaultValue: false },
  balance: { type: DataTypes.FLOAT, defaultValue: 0 },
  referralCount: { type: DataTypes.INTEGER, defaultValue: 0 },
});

User.hasMany(UserAction);

module.exports = User;
