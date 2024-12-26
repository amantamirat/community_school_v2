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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdmissionClassification'
    }]
});
// Create the model
const AcademicSession = mongoose.model('AcademicSession', AcademicSessionSchema);
module.exports = AcademicSession;