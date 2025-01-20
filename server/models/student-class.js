const mongoose = require('mongoose');
const StudentClassSchema = new mongoose.Schema({
    section_class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SectionClass',
        required: true
    },
    student_grade: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StudentGrade',
        required: true
    }
});

const StudentClass = mongoose.model('StudentClass', StudentClassSchema);
module.exports = StudentClass