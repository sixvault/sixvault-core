const jwt = require("jsonwebtoken");

const verifyAccessToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                status: "error",
                message: "No token provided",
                data: {}
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = await jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            status: "error",
            message: process.env.DEBUG ? err.message : "Invalid Token",
            data: {}
        });
    }
};

module.exports = verifyAccessToken;