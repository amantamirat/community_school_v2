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
        },
        enrollment_profile: [{
            academic_session: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'AcademicSession',
                required: false
            },
            year: {
                type: Number,
                required: false
            },
            grade: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Grade',
                required: true
            },
            average_result: {
                type: Number,
                required: true
            },
            status: {
                type: String,
                required: true,
                enum: ['PASSED', 'FAILED', 'INCOMPLETE', 'WITHDRAWN', 'ACTIVE']
            },
        }],
    }
);

const Student = mongoose.model('Student', StudentSchema);
module.exports = Student;