const mongoose = require('mongoose');
// Define the academic session schema
const AcademicSessionSchema = new mongoose.Schema({    
    academicYear: {
        type: String,
        required: true // Example: '2023-2024'
    },
    academicSemester: {
        type: Number,
        required: true
    }
});

// Create the model
const AcademicSession = mongoose.model('AcademicSession', AcademicSessionSchema);

module.exports = AcademicSession;