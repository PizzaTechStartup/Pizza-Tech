const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Configuração do Sequelize

const Admin = sequelize.define('Admin', {
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  senha: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
});

module.exports = Admin;
