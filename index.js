// Importações
require('dotenv').config();
const express = require("express");
const fileupload = require('express-fileupload');
const methodOverride = require('method-override');
const handlebars = require('express-handlebars');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const sequelize = require('./config/db');
const { autenticarToken } = require("./middleware/authtoken.js");
const clienteRoutes = require('./routes/clienteRoutes');
const produtoRoutes = require('./routes/produtoRoutes');
const carrinhoRoutes = require('./routes/carrinhoRoutes');
const adminRoutes = require('./routes/adminRoutes.js')
const pagamentoRoutes = require('./routes/pagamentoRoutes.js')
const bcrypt = require('bcrypt');
const exphbs = require('express-handlebars');
const { Pedidos, Pedido_Items, Produto, Cliente } = require('./models/Conexoes');
require('events').EventEmitter.defaultMaxListeners = 15;

// Inicialização do app
const app = express();

// Configuração do Handlebars
// Configuração do Handlebars
app.engine(
    'handlebars',
    handlebars.engine({ 
        defaultLayout: 'main',
        runtimeOptions: {
            allowProtoPropertiesByDefault: true,
            allowProtoMethodsByDefault: true
        },
        helpers: {
            eq: (a, b) => a === b, // Helper para comparação
            slice: (array, start, end) => array.slice(start, end), // Helper para limitar arrays
            filter: (array, key, value) => array.filter(item => item[key] === value), // Helper para filtro
            formatDate: (date) => new Date(date).toLocaleDateString('pt-BR'),
            formatPayment: (metodo) => { // Novo helper para formatação de pagamento
                const formatos = {
                    'cartão': 'Cartão de Crédito/Débito',
                    'dinheiro': 'Dinheiro',
                    'transferência': 'Transferência Bancária',
                };
                return formatos[metodo] || 'Método desconhecido';
            }
        }
    })
);
app.set('view engine', 'handlebars');
app.set('views', './views');


// Middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(fileupload());
app.use('/public', express.static('public'));
app.use(cookieParser());

// Configuração da sessão
app.use(session({
    secret: '12345678',
    resave: false,
    saveUninitialized: true,
}));

// Sincroniza o banco de dados
sequelize.sync()
    .then(() => console.log('Banco de dados sincronizado'))
    .catch(err => console.error('Erro ao sincronizar banco:', err));

// Rotas
app.use(clienteRoutes);
app.use(produtoRoutes);
app.use(carrinhoRoutes);
app.use(adminRoutes);
app.use(pagamentoRoutes);

// Rota inicial
app.get('/', async (req, res) => {
    try {
        // Filtra apenas pizzas e limita a 3 itens
        const produtos = await Produto.findAll({
            where: { tipo: "Pizzas" },
            order: [['id', 'ASC']],
            limit: 3
        });

        // Renderiza a página e passa os dados corretamente
        res.render('inicio', { produtos });

    } catch (erro) {
        res.status(500).send("Erro ao carregar dados: " + erro.message);
    }
});

app.get('/nos', (req, res) => {
    res.render('sobreNos');
})


// Definir porta
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na url: http://localhost:${PORT}`);
});
