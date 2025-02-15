// userRoutes.js
const express = require("express");
const userController = require("../controllers/userController"); // Adjust path as needed
const router = express.Router();
const upload = require('../middleware/uploadPhoto');

// Routes
router.post("/create", userController.createUser);
router.post("/login", userController.loginUser);
router.get("/", userController.getUsers);
router.put("/update/:id", userController.updateUser);
router.delete("/delete/:id", userController.deleteUser);
router.put('/upload-photo/:type/:id', upload.single('photo'), userController.updateUserPhoto);

module.exports = router;
