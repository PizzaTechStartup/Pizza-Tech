// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/db');

// // Importação dos modelos
// const Pedidos = require('./Pedidos');
// const Produto = require('./Produto');

// const Pedido_Items = sequelize.define('Pedido_Items', {
//     id: {
//         type: DataTypes.INTEGER,
//         autoIncrement: true,
//         primaryKey: true,
//     },
//     produto_id: {
//         type: DataTypes.INTEGER.UNSIGNED,
//         allowNull: true,
//     },
//     cliente_id: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//     },
//     quantidade: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//     },
//     valor_unitario: {
//         type: DataTypes.FLOAT,
//         allowNull: false,
//     },
//     status: {
//         type: DataTypes.STRING,
//         defaultValue: 'carrinho',
//         allowNull: true,
//     },
//     pedido_id: {
//         type: DataTypes.INTEGER,
//         allowNull: true,
//     },
// });

// // Associações
// Pedido_Items.belongsTo(Pedidos, { foreignKey: 'pedido_id', as: 'pedido' });
// Pedido_Items.belongsTo(Produto, { foreignKey: 'produto_id', as: 'produto' });

// module.exports = Pedido_Items;
