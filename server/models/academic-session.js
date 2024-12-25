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
            enum: ["R", "N", "D"], //Refers to Regular, Night and Distance
            default: "R",
            required: true
        },
        curriculum: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Curriculum',
            required: true
        },
        grade_sections: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'GradeSection',
        }]
    }]
});

// Create the model
const AcademicSession = mongoose.model('AcademicSession', AcademicSessionSchema);
module.exports = AcademicSession;