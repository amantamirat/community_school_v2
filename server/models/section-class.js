const mongoose = require('mongoose');

const SectionClassSchema = new mongoose.Schema({
    grade_section: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GradeSection',
        required: true,
        immutable: true,
    },
    subject_term: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubjectTerm',
        required: true,
        immutable: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher"
    }
});
SectionClassSchema.index({ grade_section: 1, subject_term: 1 }, { unique: true });
const SectionClass = mongoose.model('SectionClass', SectionClassSchema);
module.exports = SectionClass