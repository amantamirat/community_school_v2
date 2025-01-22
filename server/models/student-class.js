const mongoose = require('mongoose');
const StudentClassSchema = new mongoose.Schema({
    student_grade: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StudentGrade',
        required: true,
        immutable: true
    },
    section_class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SectionClass',
        required: true,
        immutable: true
    }    
});

const StudentClass = mongoose.model('StudentClass', StudentClassSchema);
module.exports = StudentClass