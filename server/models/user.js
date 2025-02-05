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
            unique: true
        },
        roles: [{
            role: {
                type: String,
                default: 'Teacher',
                enum: ['Administrator', 'Principal', 'Teacher', 'Student']
            }
        }],
    }
);
const User = mongoose.model('User', UserSchema);
module.exports = User;