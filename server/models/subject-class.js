const mongoose = require('mongoose');

const SubjectClassSchema = new mongoose.Schema({
    grade_section: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GradeSection',
        required: true
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
        required: true
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