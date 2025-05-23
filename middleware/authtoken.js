const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

function AutenticarToken(req, res, next) {
    const token = req.cookies?.token; // Verifique se o cookie está presente

    if (!token) {
        console.log('Token ausente na requisição.');
        return res.status(401).json({ error: 'Acesso negado! Token não fornecido.' });
    }

    jwt.verify(token, JWT_SECRET, (err, cliente) => {
        if (err) {
            console.log('Erro ao verificar token:', err.message);
            return res.status(403).json({ error: 'Token inválido ou expirado.' });
        }

        console.log('Token decodificado com sucesso:', cliente);
        req.cliente = cliente; // Adiciona cliente ao objeto da requisição
        next();
    });
}

module.exports = AutenticarToken;
