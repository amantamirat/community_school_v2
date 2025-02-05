const mongoose = require('mongoose');

const SectionSubjectSchema = new mongoose.Schema({
    grade_section: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GradeSection',
        required: true,
        immutable: true,
    },
    grade_subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GradeSubject',
        required: true,
        immutable: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher"
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'CLOSED',],
        default: 'ACTIVE',
        required: true
    }
    
});
SectionSubjectSchema.index({ grade_section: 1, grade_subject: 1 }, { unique: true });
const SectionSubject = mongoose.model('SectionSubject', SectionSubjectSchema);
module.exports = SectionSubject