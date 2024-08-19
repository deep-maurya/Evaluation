const jwt = require('jsonwebtoken');

const Token_auth = (req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) {
        return res.status(403).json({ status: 0, message: "Authorization token is missing", data: [] });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ status: 0, message: "Unauthorized token", data: [] });
    }
};



module.exports = {Token_auth}