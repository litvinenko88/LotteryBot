const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const UserAction = sequelize.define("UserAction", {
  actionType: DataTypes.STRING,
  details: DataTypes.TEXT,
});

module.exports = UserAction;
