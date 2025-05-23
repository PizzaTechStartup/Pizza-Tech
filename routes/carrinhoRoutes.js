const express = require('express');
const router = express.Router();
const AutenticarToken = require('../middleware/authtoken');
const { Pedidos, Pedido_Items, Produto, Cliente } = require('../models/Conexoes');

router.post('/carrinho/add', AutenticarToken, async (req, res) => {
    const { produto_id, tamanho, ingredientes_removidos, ingredientes_adicionados, quantidade } = req.body;
    const cliente_id = req.cliente.id;

    try {
        // Buscar o produto para pegar o valor
        const produto = await Produto.findByPk(produto_id);
        if (!produto) {
            return res.status(404).json({ error: "Produto não encontrado" });
        }

        // Criar o item no carrinho, incluindo o valor_unitario
        await Pedido_Items.create({
            produto_id,
            cliente_id, 
            tamanho,
            ingredientes_removidos,
            ingredientes_adicionados,
            quantidade,
            valor_unitario: produto.valor,  // Atribuindo o valor do produto
        });

        res.redirect('/carrinho');  
    } catch (error) {
        res.status(500).json({ error: "Erro ao adicionar ao carrinho: " + error.message });
    }
});




router.get('/carrinho', AutenticarToken, async (req, res) => {
    const cliente_id = req.cliente.id;

    try {
        const pedido_items = await Pedido_Items.findAll({
            where: { cliente_id, status: 'carrinho' },
            include: [
                {
                    model: Produto,
                    as: 'produto',
                    attributes: ['nome', 'valor'],
                },
            ],
        });

        // Calculando o total
        let total = 0;
        pedido_items.forEach(item => {
            total += item.produto.valor * item.quantidade;
        });

        // Passando os dados para a view
        res.render('carrinho', { pedido_items, total });
    } catch (error) {
        res.status(500).json({ error: "Erro ao carregar o carrinho: " + error.message });
    }
});



router.post('/carrinho/update', AutenticarToken, async (req, res) => {
    const { pedido_id, quantidade } = req.body;

    try {
        await Pedido_Items.update({ quantidade }, { where: { id: pedido_id } });
        res.redirect('/carrinho');  
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar o carrinho: ' + error.message });
    }
});


router.post('/carrinho/remove', AutenticarToken, async (req, res) => {
    const { pedido_id } = req.body;

    try {
        await Pedido_Items.destroy({ where: { id: pedido_id } });
        res.redirect('/carrinho');  
    } catch (error) {
        res.status(500).json({ error: 'Erro ao remover do carrinho: ' + error.message });
    }
});


router.post('/carrinho/finalizar', AutenticarToken, async (req, res) => {
    const cliente_id = req.cliente.id;
    const { metodo_pagamento } = req.body; 

    try {
        if (!metodo_pagamento) {
            throw new Error("Método de pagamento é obrigatório.");
        }

        
        const pedido = await Pedidos.create({
            cliente_id,
            metodo_pagamento, 
            status: 'em preparo',
            data_hora: new Date(),
        });

        
        await Pedido_Items.update(
            { status: 'pedido', pedido_id: pedido.id },
            { where: { cliente_id, status: 'carrinho' } }
        );

        res.redirect('/perfil'); 
    } catch (error) {
        res.status(500).json({ error: 'Erro ao finalizar compra: ' + error.message });
    }
});

 
module.exports = router;