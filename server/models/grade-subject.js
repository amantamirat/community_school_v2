const mongoose = require('mongoose');

const GradeSubjectSchema = new mongoose.Schema({
    curriculum_grade: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CurriculumGrade',
        required: true
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    }
});
GradeSubjectSchema.index({ curriculum_grade: 1, subject: 1 }, { unique: true });
const GradeSubject = mongoose.model('GradeSubject', GradeSubjectSchema);
module.exports = GradeSubject;