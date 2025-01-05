const mongoose = require('mongoose');

const ClassificationGradeSchema = new mongoose.Schema({
    academic_classification: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdmissionClassification',
        required: true
    },
    curriculum_grade: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CurriculumGrade',
        required: true
    }
});
ClassificationGradeSchema.index({ academic_classification: 1, curriculum_grade: 1 }, { unique: true });
const ClassificationGrade = mongoose.model('ClassificationGrade', ClassificationGradeSchema);
module.exports = ClassificationGrade;