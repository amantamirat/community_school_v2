const mongoose = require('mongoose');

const CurriculumGradeSchema = new mongoose.Schema({
    curriculum: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Curriculum',
        required: true
    },
    grade: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Grade',
        required: true
    }
});
CurriculumGradeSchema.index({ curriculum: 1, grade: 1 }, { unique: true });
const CurriculumGrade = mongoose.model('CurriculumGrade', CurriculumGradeSchema);
module.exports = CurriculumGrade;