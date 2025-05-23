const Pedido_Items = require('../models/modelos nao usados/Pedido_Items');

// Adicionar item ao carrinho
async function adicionarAoCarrinho(req, res) {
    const {  produto_id, tamanho, ingredientes_removidos, ingredientes_adicionados, quantidade } = req.body;

    try {
        await Pedido_Items.create({
            produto_id,
            tamanho,
            ingredientes_removidos,
            ingredientes_adicionados,
            quantidade,
        });
        res.redirect('/carrinho');
    } catch (error) {
        res.status(500).json({ error: "Erro ao adicionar ao carrinho: " + error.message });
    }
}

// Exibir carrinho
async function exibirCarrinho(req, res) {
    try {
        const pedido_items = await Pedido_Items.findAll();
        res.render('carrinho', { Pedido_Items });
    } catch (error) {
        res.status(500).json({ error: "Erro ao carregar o carrinho: " + error.message });
    }
}

// Atualizar quantidade no carrinho
async function atualizarCarrinho(req, res) {
    const { pedido_id, quantidade } = req.body;
    try {
        await Pedido_Items.update({ quantidade }, { where: { id: pedido_id } });
        res.redirect('/carrinho');
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar o carrinho: ' + error.message });
    }
}

// Remover item do carrinho
async function removerDoCarrinho(req, res) {
    const { pedido_id } = req.body;
    try {
        await Pedido_Items.destroy({ where: { id: pedido_id } });
        res.redirect('/carrinho');
    } catch (error) {
        res.status(500).json({ error: 'Erro ao remover do carrinho: ' + error.message });
    }
}

// Finalizar compra
async function finalizarCompra(req, res) {
    const cliente_id = req.cliente.id;
    try {
        await Pedido_Items.update(
            { status: 'pedido' },
            { where: { cliente_id, status: 'carrinho' } }
        );
        res.redirect('/perfil');
    } catch (error) {
        res.status(500).json({ error: 'Erro ao finalizar compra: ' + error.message });
    }
}

module.exports = { adicionarAoCarrinho, exibirCarrinho, atualizarCarrinho, removerDoCarrinho, finalizarCompra };
