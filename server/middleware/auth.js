const jwt = require('jsonwebtoken');
const authController = require('../controllers/authController');

// Define JWT secret locally
const JWT_SECRET = 'gym_management_secure_jwt_secret_key_2024';

const auth = (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'No authentication token, access denied' });
        }

        // Verify token using JWT secret
        const decoded = jwt.verify(token, JWT_SECRET);

        // Add user info to request
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is invalid' });
    }
};

module.exports = auth; 