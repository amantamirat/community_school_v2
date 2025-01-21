const mongoose = require('mongoose');

const CurriculumGradeSchema = new mongoose.Schema({
    curriculum: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Curriculum',
        required: true,
        immutable: true
    },
    grade: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Grade',
        required: true,
        immutable: true
    },
    entrance_certificate: {
        type: String
    },
    entrance_result: {
        type: Number
    }
});
CurriculumGradeSchema.index({ curriculum: 1, grade: 1 }, { unique: true });
const CurriculumGrade = mongoose.model('CurriculumGrade', CurriculumGradeSchema);
module.exports = CurriculumGrade;