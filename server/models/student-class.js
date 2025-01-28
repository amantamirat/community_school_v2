const mongoose = require('mongoose');
const StudentClassSchema = new mongoose.Schema({
    student_grade: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StudentGrade',
        required: true,
        immutable: true
    },
    term_class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TermClass',
        required: true,
        immutable: true
    }    
});
StudentClassSchema.index({ student_grade: 1, term_class: 1 }, { unique: true });
const StudentClass = mongoose.model('StudentClass', StudentClassSchema);
module.exports = StudentClass