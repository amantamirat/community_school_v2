const mongoose = require('mongoose');

const TeacherSchema = new mongoose.Schema(
    {
        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
        },
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
            default: 'Male',
            enum: ['Male', 'Female']
        }
    }
);

const Teacher = mongoose.model('Teacher', TeacherSchema);
module.exports = Teacher;
