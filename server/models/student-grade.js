const mongoose = require('mongoose');

const StudentGradeSchema = new mongoose.Schema({
    classification_grade: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClassificationGrade',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    status: {
        type: String,
        required: true,
        default: 'PENDING',
        enum: ['PENDING', 'PASSED', 'FAILED', 'INCOMPLETE']
    },
    is_new_student: {
        type: Boolean,
        required: true
    },
    external_student_prior_info: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ExternalStudentPriorInfo',
    },
    previous_student_grade: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StudentGrade',
    },
});
StudentGradeSchema.index({ classification_grade: 1, student: 1 }, { unique: true });
const StudentGrade = mongoose.model('StudentGrade', StudentGradeSchema);
module.exports = StudentGrade;