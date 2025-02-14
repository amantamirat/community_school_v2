const mongoose = require('mongoose')

const StudentSchema = new mongoose.Schema(
    {
        first_name: {
            type: String,
            required: true
        },
        middle_name: {
            type: String,
        },
        last_name: {
            type: String,
            required: true
        },
        sex: {
            type: String,
            required: true,
            enum: ['Male', 'Female']
        },
        birth_date: {
            type: Date,
            required: true
        },
        has_perior_school_info: {
            type: Boolean,
            default: false,
            required: true,
        },
        registered: {
            type: Boolean,
            default: false,
            required: true,
        },
        photo: { type: String },
        uid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
    }
);

const Student = mongoose.model('Student', StudentSchema);
module.exports = Student;