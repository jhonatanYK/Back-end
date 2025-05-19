const jwt = require('jsonwebtoken');

const AuthMiddleware = (req, res, next) => {
    // Obter o token do cabeçalho Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Token não fornecido' });
    }

    // Formato esperado: "Bearer token"
    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
        return res.status(401).json({ message: 'Formato de token inválido' });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
        return res.status(401).json({ message: 'Formato de token inválido' });
    }

    // Verificar o token
    jwt.verify(token, process.env.JWT_SECRET || 'sua_chave_secreta_temporaria', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token inválido ou expirado' });
        }

        // Armazenar informações do usuário na requisição
        req.user = decoded;
        return next();
    });
};

module.exports = {
    AuthMiddleware
};