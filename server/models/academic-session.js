const mongoose = require('mongoose');
// Define the academic session schema
const AcademicSessionSchema = new mongoose.Schema({
    academic_year: {
        type: String,
        required: true // Example: '2023-2024'
    },
    academic_semester: {
        type: Number,
        required: true
    },
    admission_classifications: [{
        classification: {
            type: String,
            enum: ["R", "N", "D"],
            default: "R",
            required: true
        },
        curriculum: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Curriculum',
            required: true
        },
        grades: [{
            grade: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Grade',
                required: true
            },
            sections: [{
                section: {
                    type: Number,
                    required: true // Example: 1, 2, 3, etc.
                },
                classes: [{
                    subject: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'Subject',
                        required: true
                    },
                    teacher: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "Teacher",
                        required: true
                    },
                    weights: [{
                        assessment_type: {
                            type: String,
                            enum: ['Quiz', 'Assignment', 'Test', 'Mid-Exam', 'Final-Exam'],
                            required: true
                        },
                        assessment_weight: {
                            type: Number,
                            min: 5,
                            max: 50,
                            required: true
                        }
                    }],
                    students: [{
                        student: {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: 'Student',
                            required: true
                        },
                        results: [{
                            weight: {
                                type: mongoose.Schema.Types.ObjectId,
                                required: true
                            },
                            result: {
                                type: Number,
                                min: 0,
                                max: 50,
                                required: true
                            }
                        }]
                    }]
                }]
            }]
        }]
    }],
});

// Create the model
const AcademicSession = mongoose.model('AcademicSession', AcademicSessionSchema);
module.exports = AcademicSession;