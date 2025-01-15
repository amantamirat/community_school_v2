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

StudentGradeSchema.pre('validate', function (next) {
    if (this.external_student_prior_info && this.previous_student_grade) {
        next(new Error('Only one of `external_student_prior_info` or `previous_student_grade` can be set.'));
    } else {
        next();
    }
});
StudentGradeSchema.index({ classification_grade: 1, student: 1 }, { unique: true });
const StudentGrade = mongoose.model('StudentGrade', StudentGradeSchema);
module.exports = StudentGrade;