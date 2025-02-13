const User = require("../models/user");
const Teacher = require("../models/teacher");
const { removePhoto } = require('../services/photoService');

const userController = {

    getUsers: async (req, res) => {
        try {
            const users = await User.find();
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ message: "Error fetching users", error });
        }
    },

    createUser: async (req, res) => {
        try {
            const { username, password, email, roles } = req.body;
            const newUser = new User({ username, password, email, roles });
            await newUser.save();            
            res.status(201).json(newUser);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: error.message });
        }
    },   

    updateUser: async (req, res) => {
        try {
            const { id } = req.params;
            const { username, password, email, roles } = req.body;
            const updatedUser = await User.findByIdAndUpdate(
                id,
                { username, password, email, roles },
                { new: true }
            );          

            if (!updatedUser) {
                return res.status(404).json({ message: "User not found" });
            }
            res.status(200).json(updatedUser);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: error.message });
        }
    },

    updateUserPhoto: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: "No file uploaded" });
            }
            const { id } = req.params;
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            if (user.photo) {  // Remove old photo
                await removePhoto(user.photo);
            }
            user.photo = `/uploads/users/${req.file.filename}`;
            const updatedUser = await user.save();

            res.status(200).json(updatedUser);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    deleteUser: async (req, res) => {
        try {
            const { id } = req.params;
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            const teacherExists = await Teacher.exists({ uid: id });
            if (teacherExists) {
                return res.status(400).json({
                    message: "Cannot delete the useraccount. Teacher Attached.",
                });
            }
            if (user.photo) {
                await removePhoto(user.photo);
            }
            await User.findByIdAndDelete(id);
            res.status(200).json({ message: "User deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = userController;
