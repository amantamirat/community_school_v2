const mongoose = require('mongoose');

const GradeSectionSchema = new mongoose.Schema({
    academic_classification: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdmissionClassification',
        required: true
    },
    grade: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Grade',
        required: true
    },
    section: {
        type: Number,
        required: true
    },
    subject_class: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubjectClass',
        required: true
    }]

});
// Create the model
const GradeSection = mongoose.model('GradeSection', GradeSectionSchema);
module.exports = GradeSection;