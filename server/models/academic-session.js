const mongoose = require('mongoose');
// Define the academic session schema
const AcademicSessionSchema = new mongoose.Schema({
    academic_year: {
        type: String,
        required: true,
        index: { unique: true }// Example: '2023'
    },
    start_date: {
        type: Date,
        required: true
    },
    end_date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'CLOSED', 'PLANNED'],
        default: 'PLANNED',
        required: true
    }
});
// Create the model
const AcademicSession = mongoose.model('AcademicSession', AcademicSessionSchema);
module.exports = AcademicSession;