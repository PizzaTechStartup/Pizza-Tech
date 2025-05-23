const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');


// Definição do modelo 'Pedidos'
const Pedidos = sequelize.define('Pedidos', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    cliente_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    itens: {
        type: DataTypes.TEXT, // Pode armazenar JSON como string
        allowNull: false,
    },
    data_hora: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('em preparo', 'a caminho', 'entregue'),
        defaultValue: 'em preparo',
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    metodo_pagamento: {
        type: DataTypes.ENUM('cartão', 'dinheiro', 'transferência'),
        allowNull: false,
    },
    observacoes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    endereco_entrega: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'pedidos', // Nome da tabela no banco de dados
    timestamps: true,    // Cria as colunas createdAt e updatedAt
});


// Definição do modelo 'Produto'
const Produto = sequelize.define('Produto', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    valor: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    categoria: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    tipo: {
        type: DataTypes.ENUM('Pizzas', 'Bebidas', 'Outro'),
        allowNull: false,
    },
});

// Definição do modelo 'Pedido_Items'
const Pedido_Items = sequelize.define('Pedido_Items', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    produto_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
    },
    cliente_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    quantidade: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    valor_unitario: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'carrinho',
        allowNull: true,
    },
    pedido_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    }
});

const Cliente = sequelize.define('Cliente', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    senha: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

// Associações
Cliente.hasMany(Pedidos, { foreignKey: 'cliente_id', as: 'pedidos' });
Pedidos.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });

Pedidos.hasMany(Pedido_Items, {
    foreignKey: 'pedido_id',
    as: 'pedidoItens',  // Altere de 'itens' para 'pedidoItens' ou qualquer outro nome
});

Pedido_Items.belongsTo(Pedidos, {
    foreignKey: 'pedido_id',
    as: 'pedido',
});

Pedido_Items.belongsTo(Produto, {
    foreignKey: 'produto_id',
    as: 'produto',
});

sequelize.sync({ alter: true }) // Use apenas em ambiente de desenvolvimento
    .then(() => console.log('Banco de dados sincronizado'))
    .catch(err => console.error('Erro ao sincronizar banco:', err));


// Exportando todos os modelos juntos
module.exports = {
    sequelize,
    Pedidos,
    Pedido_Items,
    Produto,
    Cliente
}; 
