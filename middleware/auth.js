const jwt = require('jsonwebtoken');

function adminAuth(req, res, next) {
    const token = req.cookies.token; // ou `req.headers.authorization` dependendo do uso

    if (!token) {
        return res.status(401).json({ error: 'Acesso negado. Faça login.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Verifica se o usuário é administrador
        if (!decoded.isAdmin) {
            return res.status(403).json({ error: 'Acesso proibido. Somente administradores podem acessar.' });
        }

        // Passa as informações do token para a requisição
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Token inválido.' });
    }
}

module.exports = { adminAuth };
