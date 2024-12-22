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
    classifications: [{
        classification: {
            type: String,
            required: true,
            default: "R",
            enum: ["R", "N", "D"]
        },
        curriculums: [{
            curriculum: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Curriculum'
            },
        }],
        grades: [{
            grade: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Grade'
            },
            sections: {
                type: Number
            }
        }]
    }],

});

// Create the model
const AcademicSession = mongoose.model('AcademicSession', AcademicSessionSchema);

module.exports = AcademicSession;