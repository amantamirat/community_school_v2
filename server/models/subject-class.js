const mongoose = require('mongoose');
//section_class or class or subject class or section_grade_subject
const SubjectClassSchema = new mongoose.Schema({
    grade_section: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GradeSection',
        required: true
    },
    grade_subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GradeSubject',
        required: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher"
    },
    weights: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Weight'
    }],
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StudentResult',
    }]
});

const SubjectClass = mongoose.model('SubjectClass', SubjectClassSchema);
module.exports = SubjectClass