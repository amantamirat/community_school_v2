const jwt = require("jsonwebtoken");
require('dotenv').config();

// Middleware to authenticate the token (basic verification)
const authenticateToken = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1]; // Get token from Authorization header
    if (!token) return res.status(403).json({ message: "Unauthorized" });
    try {
        const decoded = jwt.verify(token, process.env.KEY); // Verify the token
        req.user = decoded; // Attach user info to request object
        next(); // Proceed to next middleware/route handler
    } catch (error) {
        return res.status(403).json({ message: "Invalid token" });
    }
};

// Middleware to verify if the user is an Administrator
const verifyAdmin = (req, res, next) => {
    if (!req.user || !req.user.roles || !req.user.roles.includes("Administrator")) {
        return res.status(403).json({ message: "Access denied. You are not an Administrator." });
    }
    next(); // If admin, continue to the next handler
};

const verifyPrinicipal = (req, res, next) => {
    if (!req.user || !req.user.roles || !req.user.roles.includes("Principal")) {
        return res.status(403).json({ message: "Access denied. You are not a Principal." });
    }
    next(); // If prinicipal, continue to the next handler
};

module.exports = { authenticateToken, verifyAdmin, verifyPrinicipal };
