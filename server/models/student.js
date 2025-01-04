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
        enrollment: [{
            admission_classification: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'AdmissionClassification',
                required: true
            },
            grade: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Grade',
                required: true
            },
            status: {
                type: String,
                required: true,
                enum: ['ACTIVE', 'PASSED', 'FAILED', 'INCOMPLETE', 'WITHDRAWN']
            },
        }],
        previous_profile: [{
            school_information: {
                type: String,
                required: true
            },
            year: {
                type: String,
                required: true
            },
            classification: {
                type: String,
                enum: ["REGULAR", "EVENING", "DISTANCE"], // Refers to Regular, Night, and Distance
                default: "REGULAR",
                required: true
            },
            grade: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Grade',
                required: true
            },
            status: {
                type: String,
                required: true,
                enum: ['ACTIVE', 'PASSED', 'FAILED', 'INCOMPLETE', 'WITHDRAWN']
            },
        }],
    }
);

const Student = mongoose.model('Student', StudentSchema);
module.exports = Student;