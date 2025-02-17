const User = require("../models/user");
const bcrypt = require("bcryptjs");

const prepareHash = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

const createUserAccount = async (user) => {
    const { username, password, email, roles } = user;
    const hashedPassword = await prepareHash(password);
    const newUser = new User({ username, password: hashedPassword, email, roles });
    return await newUser.save();
};
const createAdminUser = async () => {
    try {
        const existingAdmin = await User.findOne({ username: 'root' });
        if (!existingAdmin) {
            await createUserAccount({ username: 'root', email: 'root', password: 'rootpassword', roles: ["Administrator"] });
            console.log('Admin user created successfully.');
        } else {
            console.log('Admin user already exists.');
        }
    } catch (error) {
        console.error('Error creating admin user:', error);
    }
};
module.exports = { createUserAccount, prepareHash, createAdminUser};