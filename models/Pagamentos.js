const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Configuração do Sequelize

const Pagamentos = sequelize.define('Pagamentos', {
  pedido_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Pedidos', key: 'id' },
  },
  data_pagamento: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  valor: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  metodo_pagamento: {
    type: DataTypes.ENUM('cartão', 'dinheiro', 'transferência'),
    allowNull: false,
  },
});

module.exports = Pagamentos;
