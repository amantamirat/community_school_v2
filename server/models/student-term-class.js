const mongoose = require('mongoose');
const StudentTermClassSchema = new mongoose.Schema({
    student_grade: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StudentGrade',
        required: true,
        immutable: true
    },
    subject_term: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubjectTerm',
        required: true,
        immutable: true
    },
    section_class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SectionClass'
    }    
});
StudentTermClassSchema.index({ student_grade: 1, subject_term: 1 }, { unique: true });
const StudentTermClass = mongoose.model('StudentTermClass', StudentTermClassSchema);
module.exports = StudentTermClass