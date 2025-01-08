const mongoose = require('mongoose');
const SubjectWeightSchema = new mongoose.Schema({
    grade_subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GradeSubject',
        required: true
    },
    assessment_type: {
        type: String,
        enum: ['Quiz', 'Assignment', 'Test', 'Mid-Exam', 'Final-Exam'],
        required: true
    },
    assessment_weight: {
        type: Number,
        min: 5,
        max: 100,
        required: true
    }
});
const SubjectWeight = mongoose.model('SubjectWeight', SubjectWeightSchema);
module.exports = SubjectWeight