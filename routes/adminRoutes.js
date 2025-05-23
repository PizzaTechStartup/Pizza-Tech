const express = require('express');
const router = express.Router();
const { Pedidos, Pedido_Items, Produto, Cliente } = require('../models/Conexoes');
const jwt = require('jsonwebtoken');
const { adminAuth } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

router.get('/admin/login', (req, res) => {
    res.render('loginAdmin');
});

router.post('/admin/login',  (req, res) => {
    const { email, senha } = req.body;

    try {
        // Email e senha padrão
        const emailPadrao = "pizzatech@gmail.com";
        const senhaPadrao = "PizzaTech123";

        // Verifica se as credenciais estão corretas
        if (email !== emailPadrao || senha !== senhaPadrao) {
            return res.render('loginAdmin', { error: 'E-mail ou senha inválidos.' });
        }

        // Gera o token JWT para autenticação
        const token = jwt.sign({ isAdmin: true }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        // Armazena o token nos cookies
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/admin/perfil');
    } catch (error) {
        console.error(error);
        res.render('loginAdmin', { error: 'Erro ao realizar login. Tente novamente.' });
    }
});



router.get("/admin/produto/cadastrar", adminAuth, (req, res) => {
    res.render('cadastrarProduto');
});

router.post("/admin/produto/cadastrar", adminAuth, async (req, res) => {
    try {
        if (!req.files || !req.files.imagem) {
            return res.status(400).send("Nenhum arquivo enviado.");
        }

        let imagem = req.files.imagem;
        const caminho = `public/uploads/${imagem.name}`;

        await imagem.mv(caminho);

        await Produto.create({
            nome: req.body.nome,
            valor: req.body.valor,
            categoria: req.body.categoria,
            tipo: req.body.tipo
        });

        res.redirect("/admin/produtos");
    } catch (erro) {
        res.status(500).send("Erro ao cadastrar produto: " + erro.message);
    }
});

router.get("/admin/produtos", adminAuth, async (req, res) => {
    try {
        const produtos = await Produto.findAll({ order: [['id', 'DESC']] });
        res.render('produto', { produtos });
    } catch (erro) {
        res.status(500).send("Erro ao carregar produtos: " + erro.message);
    }
});



router.get('/admin/perfil', async (req, res) => {
    try {
        console.log("Iniciando busca de pedidos...");

        // Buscar pedidos com as inclusões necessárias
        const pedidos = await Pedidos.findAll({
            include: [
                {
                    model: Cliente,
                    as: 'cliente',
                    attributes: ['nome'],
                },
            ],
            order: [['createdAt', 'DESC']],
            limit: 3,
        });

        if (!pedidos || pedidos.length === 0) {
            console.log("Nenhum pedido encontrado.");
            return res.render('dashboard', { pedidos: [] });
        }

        // Converte as instâncias do Sequelize em objetos JSON
        const pedidosFormatados = [];
        
        // Itera sobre os pedidos retornados
        for (const pedido of pedidos) {
            const pedidoJson = pedido.toJSON(); // Converte a instância em JSON

            // Preenche os dados de cada pedido formatado
            pedidosFormatados.push({
                cliente: pedidoJson.cliente?.nome || 'Cliente não encontrado',
                data: pedidoJson.createdAt.toLocaleDateString(),
                produto: pedidoJson.itens || 'Produto não especificado',  // Verifique se 'itens' está correto
                total: pedidoJson.total || 'Total não especificado',
            });
        }

        console.log("Pedidos formatados:", pedidosFormatados);

        // Enviar os pedidos para o template
        res.render('dashboard', { pedidos: pedidosFormatados });
    } catch (error) {
        console.error("Erro ao carregar pedidos:", error);
        res.status(500).send('Erro ao carregar pedidos: ' + error.message);
    }
});

  

// Tela de pedidos (filtrada por período)
router.get('/admin/pedidos', adminController.getPedidos);

router.get('/admin/pedidos/:id', async (req, res) => {
    try {
        const pedidoId = req.params.id;

        // Buscar o pedido no banco com os detalhes necessários
        const pedido = await Pedidos.findOne({
            where: { id: pedidoId },
            include: [
                {
                    model: Pedido_Items,
                    as: 'pedidoItens',
                    include: [
                        {
                            model: Produto,
                            as: 'produto',
                            attributes: ['nome', 'valor'], // Seleciona os atributos necessários
                        },
                    ],
                },
                {
                    model: Cliente,
                    as: 'cliente',
                    attributes: ['nome', 'email'], // Seleciona os atributos necessários
                },
            ],
        });

        if (!pedido) {
            return res.status(404).send('Pedido não encontrado');
        }

        // Renderiza a página passando os detalhes do pedido
        res.render('pedido', { pedido: pedido.toJSON() });
    } catch (error) {
        console.error('Erro ao buscar pedido:', error);
        res.status(500).send('Erro ao buscar pedido');
    }
});

// Atualizar o status de um pedido
router.post('/admin/pedidos/:id/status', async (req, res) => {
    try {
        const pedidoId = req.params.id;
        const { status } = req.body;

        // Atualizar o status no banco de dados
        const pedido = await Pedidos.findOne({ where: { id: pedidoId } });
        if (!pedido) {
            return res.status(404).send('Pedido não encontrado');
        }

        pedido.status = status;
        await pedido.save();

        res.redirect(`/admin/pedidos`); // Redireciona de volta para a página do pedido
    } catch (error) {
        console.error('Erro ao atualizar o status do pedido:', error);
        res.status(500).send('Erro ao atualizar o status do pedido');
    }
});



module.exports = router;
