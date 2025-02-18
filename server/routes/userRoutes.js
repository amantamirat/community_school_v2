const express = require("express");
const userController = require("../controllers/userController");
const router = express.Router();
const upload = require('../middleware/uploadPhoto');
const { authenticateToken, verifyAdmin } = require("../middleware/auth"); // Import both middlewares

// Routes
router.post("/create", authenticateToken, verifyAdmin, userController.createUser);
router.post("/login", userController.loginUser);
router.get("/", authenticateToken, verifyAdmin, userController.getUsers);
router.put("/update/:id", authenticateToken, verifyAdmin, userController.updateUser);
router.put("/change-password/:id", authenticateToken,userController.changePassword);
router.put("/change-user-password/:id", authenticateToken, verifyAdmin,userController.changeUserPassword);
router.delete("/delete/:id", authenticateToken, verifyAdmin, userController.deleteUser);
router.put('/upload-photo/:type/:id', authenticateToken, upload.single('photo'), userController.updateUserPhoto);

module.exports = router;
