const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Ticket', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    lotteryId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    }
  }, {
    timestamps: true
  });
};