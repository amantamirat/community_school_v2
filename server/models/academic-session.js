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
    curriculums: [{
        curriculum: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Curriculum'
        },
    }]
});

// Create the model
const AcademicSession = mongoose.model('AcademicSession', AcademicSessionSchema);

module.exports = AcademicSession;