const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('LotteryView', {
    lotteryId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    timestamps: true,
    indexes: [
      { unique: true, fields: ['lotteryId', 'userId'] }
    ]
  });
};