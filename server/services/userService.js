const User = require("../models/user");
const bcrypt = require("bcryptjs");
const createUserAccount = async (user) => {
    const { username, password, email, roles } = user;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ username, password:hashedPassword, email, roles });
    return await newUser.save();
}
module.exports = { createUserAccount };