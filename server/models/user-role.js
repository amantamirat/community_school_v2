const mongoose = require('mongoose');

const UserRoleSchema = new mongoose.Schema({
    user_account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        immutable: true,
    },
    role: {
        type: String,
        default: 'Teacher',
        enum: ['Administrator', 'Principal', 'Teacher', 'Student']
    }, 
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
    },

    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
    },

});
const UserRole = mongoose.model('UserRole', UserRoleSchema);
module.exports = UserRole