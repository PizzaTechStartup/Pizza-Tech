const express = require('express');
const router = express.Router();
const autenticarToken = require('../middleware/authtoken');
const { Pedidos, Pedido_Items, Produto, Cliente } = require('../models/Conexoes');
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');




router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/clientes/login', async (req, res) => {
    try {
        const cliente = await Cliente.findOne({ where: { email: req.body.email } });

        if (!cliente || !(await bcrypt.compare(req.body.senha, cliente.senha))) {
            return res.status(400).json({ error: 'E-mail ou senha inválidos.' });
        }

        const token = jwt.sign({ id: cliente.id }, process.env.JWT_SECRET, {
            expiresIn: '6h',
        });

        res.cookie('token', token, { httpOnly: true });
        res.redirect('/perfil');
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

router.get('/cadastro', (req, res) => {
    res.render('cadastro');
});

router.post('/clientes/registrar', async (req, res) => {
    const { nome, email, senha, confirmarSenha } = req.body;

    try {
        if (senha !== confirmarSenha) {
            return res.status(400).json({ error: 'As senhas não coincidem.' });
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        const novoCliente = await Cliente.create({
            nome,
            email,
            senha: senhaHash,
        });

        res.redirect('/login');
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


router.get('/perfil', autenticarToken, async (req, res) => {
    try {
        // Busca o cliente autenticado
        const cliente = await Cliente.findByPk(req.cliente.id, {
            attributes: ['nome', 'email'],
        });

        if (!cliente) {
            return res.status(404).json({ error: 'Cliente não encontrado.' });
        }

        // Busca os pedidos do cliente
        const pedidos = await Pedidos.findAll({
            where: { cliente_id: req.cliente.id },
            include: [
                {
                    model: Pedido_Items,
                    as: 'pedidoItens', // Atualizado para refletir o novo alias
                    include: [
                        {
                            model: Produto,
                            as: 'produto',
                            attributes: ['nome', 'valor'],
                        },
                    ],
                },
            ],
            order: [['data_hora', 'DESC']],
            limit: 9,
        });


        // Formata os pedidos
        const historico = pedidos.map((pedido) => ({
            id: pedido.id,
            data: new Date(pedido.data_hora).toLocaleString('pt-BR'),
            status: pedido.status,
            total: parseFloat(pedido.total).toFixed(2),
            itens: pedido.pedidoItens.map((item) => ({
                nome: item.produto.nome,
                quantidade: item.quantidade,
                valor_unitario: parseFloat(item.valor_unitario).toFixed(2),
            })),
        }));

        res.render('perfil', { cliente, historico });
    } catch (error) {
        console.error('Erro ao carregar perfil e histórico:', error.message);
        res.status(500).json({ error: 'Erro ao carregar perfil.' });
    }
});

router.get('/pedidos', autenticarToken, async (req, res) => {
    try {
        const pedidos = await Pedidos.findAll({
            where: { cliente_id: req.cliente.id },
            order: [['data_hora', 'DESC']],
        });

        res.render('pedidosCliente', { pedidos: pedidos.map(p => p.toJSON()) });
    } catch (error) {
        console.error('Erro ao carregar pedidos:', error.message);
        res.status(500).send('Erro ao carregar pedidos.');
    }
});

router.get('/pedidos/:id', autenticarToken, async (req, res) => {
    try {
        const pedido = await Pedidos.findOne({
            where: { id: req.params.id, cliente_id: req.cliente.id },
            include: [
                {
                    model: Pedido_Items,
                    as: 'pedidoItens',
                    include: [
                        { model: Produto, as: 'produto', attributes: ['nome', 'valor'] }
                    ]
                }
            ],
        });

        if (!pedido) {
            return res.status(404).send('Pedido não encontrado.');
        }

        res.render('detalhesPedido', { pedido: pedido.toJSON() });
    } catch (error) {
        console.error('Erro ao carregar detalhes do pedido:', error.message);
        res.status(500).send('Erro ao carregar detalhes do pedido.');
    }
});


module.exports = router;