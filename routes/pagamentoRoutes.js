const express = require('express');
const router = express.Router();
const { Pedidos, Pedido_Items, Produto, Cliente } = require('../models/Conexoes');
const AutenticarToken = require('../middleware/authtoken');


router.get('/pagamento', AutenticarToken, async (req, res) => {
  const cliente_id = req.cliente.id;

  try {
    const itensCarrinho = await Pedido_Items.findAll({
      where: { cliente_id, status: 'carrinho' },
      include: [
        {
          model: Produto,
          as: 'produto',
          attributes: ['nome', 'valor'],
        },
      ],
    });

    if (itensCarrinho.length === 0) {
      return res.status(400).json({ error: 'Carrinho está vazio.' });
    }

    const total = itensCarrinho.reduce(
      (acc, item) => acc + item.produto.valor * item.quantidade,
      0
    );

    res.render('pagamento', { itens: itensCarrinho, total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao carregar a tela de pagamento: ' + error.message });
  }
});

router.post('/pagamento', AutenticarToken, async (req, res) => {
  try {
    const cliente_id = req.cliente.id;
    const { metodo_pagamento, observacoes, endereco_entrega } = req.body;

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

    if (!pedido_items.length) {
      return res.status(400).json({ error: 'Carrinho vazio!' });
    }

    let total = 0;
    const itens = pedido_items.map(item => {
      if (item.produto) {
        total += item.produto.valor * item.quantidade;
        return {
          produto: item.produto.nome,
          tamanho: item.tamanho,
          quantidade: item.quantidade,
          valor_unitario: item.produto.valor,
        };
      }
      return null;
    }).filter(Boolean);

    const novoPedido = await Pedidos.create({
      cliente_id,
      itens: JSON.stringify(itens),
      data_hora: new Date(),
      status: 'em preparo',
      total: total.toFixed(2),
      metodo_pagamento,
      observacoes,
      endereco_entrega,
    });

    await Promise.all(
      pedido_items.map(item => {
        return item.update({
          status: 'pago',
          pedido_id: novoPedido.id,
        });
      })
    );

    res.status(200).json({ message: 'Pedido criado e pagamento confirmado com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao processar o pagamento: ' + error.message });
  }
});

router.get('/pedido/sucesso', (req, res) => {
  res.render('sucesso')
})


module.exports = router;
