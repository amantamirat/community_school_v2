const mongoose = require('mongoose');

const ClassificationGradeSchema = new mongoose.Schema({
    admission_classification: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdmissionClassification',
        required: true,
        immutable: true
    },
    curriculum_grade: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CurriculumGrade',
        required: true,
        immutable: true
    }
});
ClassificationGradeSchema.index({ admission_classification: 1, curriculum_grade: 1 }, { unique: true });
const ClassificationGrade = mongoose.model('ClassificationGrade', ClassificationGradeSchema);
module.exports = ClassificationGrade;