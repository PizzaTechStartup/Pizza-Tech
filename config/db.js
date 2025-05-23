const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('pizzatech', 'root', 'pizzatech', {
    host: 'localhost',
    dialect: 'mysql',
});

module.exports = sequelize;
