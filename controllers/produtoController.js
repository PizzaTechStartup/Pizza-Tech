const Produtos = require('../models/modelos nao usados/Produto');
const fileupload = require('express-fileupload');

// Listar todos os produtos
async function listarProdutos(req, res) {
    try {
        const produtos = await Produtos.findAll({ order: [['id', 'DESC']] });
        res.render('cardapio', { produtos });
    } catch (error) {
        res.status(500).send("Erro ao carregar produtos: " + error.message);
    }
}

// Cadastrar um novo produto
async function cadastrarProduto(req, res) {
    try {
        if (!req.files || !req.files.imagem) {
            return res.status(400).send("Nenhum arquivo enviado.");
        }

        let imagem = req.files.imagem;
        const caminho = `public/uploads/${imagem.name}`;

        await imagem.mv(caminho);

        await Produtos.create({
            nome: req.body.nome,
            valor: req.body.valor,
            categoria: req.body.categoria,
        });

        res.redirect("/produtos");
    } catch (error) {
        res.status(500).send("Erro ao cadastrar produto: " + error.message);
    }
}

// Excluir produto
async function excluirProduto(req, res) {
    try {
        const produto = await Produtos.findByPk(req.params.id);
        if (produto) {
            await produto.destroy();
            res.redirect('/produtos');
        } else {
            res.status(404).send('Produto não encontrado');
        }
    } catch (error) {
        res.status(500).send("Erro ao excluir produto: " + error.message);
    }
}

module.exports = { listarProdutos, cadastrarProduto, excluirProduto };
