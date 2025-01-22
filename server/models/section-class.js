const mongoose = require('mongoose');
//section_class or class or subject class or section_grade_subject
const SectionClassSchema = new mongoose.Schema({
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
    }
});
SectionClassSchema.index({ grade_section: 1, grade_subject: 1 }, { unique: true });
const SectionClass = mongoose.model('SectionClass', SectionClassSchema);
module.exports = SectionClass