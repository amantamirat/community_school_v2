const mongoose = require('mongoose');

const GradeSectionSchema = new mongoose.Schema({
    classification_grade: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClassificationGrade',
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

GradeSectionSchema.index({ classification_grade: 1, section: 1 }, { unique: true });
const GradeSection = mongoose.model('GradeSection', GradeSectionSchema);
module.exports = GradeSection;