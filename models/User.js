const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define(
  "User",
  {
    telegramId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    username: DataTypes.STRING,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    rulesAccepted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    balance: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    referralCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = User;
