const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin')
const { Pedidos, Pedido_Items, Produto, Cliente } = require('../models/Conexoes');
const { Op } = require('sequelize');


async function adminLogin(req, res) {
    try {
        const admin = await Admin.findOne({ where: { email: req.body.email } });
        if (!admin || !(await bcrypt.compare(req.body.senha, admin.senha))) {
            return res.status(400).json({ error: 'E-mail ou senha inválidos.' });
        }

        const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/perfil');
    } catch (error) {
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}

function adminAuth(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/admin/login');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Verifica se é administrador
        if (!decoded.isAdmin) {
            return res.status(403).send('Acesso proibido.');
        }

        req.user = decoded;
        next();
    } catch (err) {
        res.redirect('/admin/login');
    }
}

async function getPedidos(req, res) {
    try {
        const pedidos = await Pedidos.findAll({
            include: [
                {
                    model: Cliente,
                    as: 'cliente', // Mesmo nome usado em Pedidos.belongsTo
                    attributes: ['id', 'nome', 'email'],
                },
                {
                    model: Pedido_Items,
                    as: 'pedidoItens', // Mesmo nome usado em Pedidos.hasMany
                },
            ],
            order: [['data_hora', 'DESC']],
        });

        res.render('pedidos', {
            pedidos: pedidos.map(pedido => pedido.toJSON()),
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao buscar pedidos');
    }
}



// Função para atualizar o status de um pedido
const updateStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        // Busca o pedido pelo ID
        const pedido = await Pedidos.findByPk(id);
        if (!pedido) {
            return res.status(404).send('Pedido não encontrado');
        }

        // Atualiza o status
        pedido.status = status;
        await pedido.save();

        res.redirect('/admin/pedidos');
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        res.status(500).send('Erro no servidor');
    }
};


module.exports = { adminAuth, adminLogin,  getPedidos, updateStatus };
