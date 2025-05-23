const Cliente = require('../models/Cliente');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Login de cliente
async function login(req, res) {
    try {
        const cliente = await Cliente.findOne({ where: { email: req.body.email } });
        if (!cliente || !(await bcrypt.compare(req.body.senha, cliente.senha))) {
            console.log('Falha no login: Credenciais inválidas.');
            return res.status(400).json({ error: 'E-mail ou senha inválidos.' });
        }

        // Gera o token JWT
        const token = jwt.sign({ id: cliente.id }, process.env.JWT_SECRET, { expiresIn: '6h' });
        console.log('Token gerado:', token);

        // Configura o cookie no navegador
        res.cookie('token', token, {
            httpOnly: true, // O cookie só pode ser acessado pelo servidor
            secure: process.env.NODE_ENV === 'production', // Habilita HTTPS em produção
            maxAge: 6 * 60 * 60 * 1000, // Expira em 6 horas
        });

        res.redirect('/perfil');
    } catch (error) {
        console.error('Erro no login:', error.message);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}


// Registro de cliente
async function registrar(req, res) {
    const { nome, email, senha, confirmarSenha } = req.body;
    try {
        if (senha !== confirmarSenha) {
            return res.status(400).json({ error: 'As senhas não coincidem.' });
        }

        const senhaHash = await bcrypt.hash(senha, 10);
        await Cliente.create({ nome, email, senha: senhaHash });
        res.redirect('/login');
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// Perfil de cliente
async function perfil(req, res) {
    try {
        console.log('Requisição recebida para o perfil. Cliente ID:', req.cliente?.id);
        const cliente = await Cliente.findByPk(req.cliente.id, { attributes: ['nome', 'email'] });

        if (!cliente) {
            return res.status(404).json({ error: "Cliente não encontrado." });
        }

        res.render('perfil', { cliente });
    } catch (error) {
        console.error('Erro ao carregar o perfil:', error.message);
        res.status(500).json({ error: "Erro ao carregar perfil: " + error.message });
    }
}


module.exports = { login, registrar, perfil };
