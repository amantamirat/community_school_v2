// Define the grade-subject schema
const mongoose = require('mongoose');

const GradeSubjectSchema = new mongoose.Schema({
    grade: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Grade",
        required: true
    },
    subjects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: true
    }]
});

const GradeSubject = mongoose.model('GradeSubject', GradeSubjectSchema);
module.exports = GradeSubject;
