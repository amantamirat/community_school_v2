const mongoose = require('mongoose');
const StudentClassSchema = new mongoose.Schema({
    student_grade: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StudentGrade',
        required: true,
        immutable: true
    },
    subject_term: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubjectTerm',
        immutable: true,
        sparse:true,
    },
    term_class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TermClass',
        immutable: true,
        sparse:true,
    },
    total_result: {
        type: Number,
        min: 0
    },       
    status: {
        type: String,
        enum: ['ACTIVE', 'COMPLETED', 'INCOMPLETE'],
        default: 'ACTIVE',
        required: true
    }
});
StudentClassSchema.index({ student_grade: 1, term_class: 1 }, { unique: true });
StudentClassSchema.index({ student_grade: 1, subject_term: 1 }, { unique: true });
const StudentClass = mongoose.model('StudentClass', StudentClassSchema);
module.exports = StudentClass