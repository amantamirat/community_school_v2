const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        email: {
            type: String,
            unique: true,
            sparse: true
        },
        photo: {
            type: String
        },
        roles: [{
            type: String,
            enum: ['Administrator', 'Principal', 'Home-Teacher', 'Teacher', 'Student']
        }]
    }
);
const User = mongoose.model('User', UserSchema);
module.exports = User;