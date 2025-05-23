const express = require('express');
const router = express.Router();
const AutenticarToken = require('../middleware/authtoken');
const { Pedidos, Pedido_Items, Produto, Cliente } = require('../models/Conexoes');

router.get("/cardapio", AutenticarToken, async (req, res) => {
    try {
        const produtos = await Produto.findAll({
            order: [['id', 'DESC']],
        });

        res.render('cardapio', { produtos: produtos});

    } catch (erro) {
        res.status(500).send("Erro ao carregar produtos: " + erro.message);
    }
});


module.exports = router;

