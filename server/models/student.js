const mongoose = require('mongoose')

const StudentSchema = new mongoose.Schema(
    {
        first_name: {
            type: String,
            required: true
        },
        middle_name: {
            type: String,
            required: true
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
        }
    }
);

const Student = mongoose.model('Student', StudentSchema);

module.exports = Student;