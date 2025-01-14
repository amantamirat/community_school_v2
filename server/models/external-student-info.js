const mongoose = require('mongoose');
// Define the academic session schema
const ExternalStudentPriorInfoSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    school_name: {
        type: String,
        required: true
    },
    academic_year: {
        type: Number,
        required: true
    },
    classification: {
        type: String,
        enum: ['REGULAR', 'EVENING', 'DISTANCE'], // Refers to Regular, Night, and Distance
        default: 'REGULAR',
        required: true
    },
    grade: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Grade',
        required: true
    },
    average_result: {
        type: Number,
        min: 0,
        max: 100,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['PASSED', 'FAILED', 'INCOMPLETE']
    },
    transferReason: {
        type: String,
        required: false
    }
});

ExternalStudentPriorInfoSchema.index({ student: 1, academic_year: 1 }, { unique: true });
const ExternalStudentPriorInfo = mongoose.model('ExternalStudentPriorInfo', ExternalStudentPriorInfoSchema);
module.exports = ExternalStudentPriorInfo;