const jwt = require('jsonwebtoken');
const JWT_SECRET = 'INI_ADALAH_KUNCI_RAHASIA_ANDA_YANG_SANGAT_AMAN';

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

const authorizeRole = (role) => {
    return (req, res, next) => {
        if (req.user && req.user.role === role) {
            next();
        } else {
            res.sendStatus(403);
        }
    };
};

module.exports = { authenticateToken, authorizeRole };
