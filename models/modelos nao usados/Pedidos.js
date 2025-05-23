// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/db'); // Configuração do Sequelize
// const Pedido_Items = require('./Pedido_Items'); // Relacionamento com Pedido_Items

// const Pedidos = sequelize.define('Pedidos', {
//     id: {
//         type: DataTypes.INTEGER,
//         autoIncrement: true,
//         primaryKey: true,
//     },
//     cliente_id: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//     },
//     total: {
//         type: DataTypes.DECIMAL(10, 2),
//         allowNull: false,
//     },
//     data_hora: {
//         type: DataTypes.DATE,
//         defaultValue: DataTypes.NOW,
//     },
//     status: {
//         type: DataTypes.STRING,
//         defaultValue: 'em preparo',
//     },
// });

// // Associações
// Pedidos.hasMany(Pedido_Items, { foreignKey: 'pedido_id', as: 'itens' });

// module.exports = Pedidos;
