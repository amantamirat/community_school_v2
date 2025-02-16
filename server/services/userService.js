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
}
module.exports = { createUserAccount, prepareHash };