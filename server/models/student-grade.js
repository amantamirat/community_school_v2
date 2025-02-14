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
    grade_section: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GradeSection'
    },
    average_result: {
        type: Number,
        min: 0
    },
    status: {
        type: String,
        required: true,
        default: 'ACTIVE',
        enum: ['ACTIVE', 'PROMOTED', 'FAILED', 'INCOMPLETE']
    },
    external_student_prior_info: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ExternalStudentPriorInfo',
        unique: true,
        sparse: true
    },
    previous_student_grade: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StudentGrade',
        unique: true,
        sparse: true
    },
    registered: {
        type: Boolean,
        default: false,
        required: true,
    }
});

StudentGradeSchema.index({ classification_grade: 1, student: 1 }, { unique: true });
const StudentGrade = mongoose.model('StudentGrade', StudentGradeSchema);
module.exports = StudentGrade;