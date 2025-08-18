const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Lottery', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    link: {
      type: DataTypes.STRING,
      allowNull: false
    },
    photoId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('draft', 'active', 'completed'),
      defaultValue: 'draft'
    },
    participants: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    maxParticipants: {
      type: DataTypes.INTEGER,
      defaultValue: 100
    }
  }, {
    timestamps: true
  });
};