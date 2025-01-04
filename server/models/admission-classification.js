const mongoose = require('mongoose');

const AdmissionClassificationSchema = new mongoose.Schema({
    academic_session: { // Redundant reference
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AcademicSession',
        required: true
    },
    classification: {
        type: String,
        enum: ['REGULAR', 'EVENING', 'DISTANCE'], // Refers to Regular, Night, and Distance
        default: 'REGULAR',
        required: true
    },
    number_of_terms: {
        type: Number,
        default: 2,
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
});

const AdmissionClassification = mongoose.model('AdmissionClassification', AdmissionClassificationSchema);
module.exports = AdmissionClassification;