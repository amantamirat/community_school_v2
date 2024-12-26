const mongoose = require('mongoose');
const WeightSchema = new mongoose.Schema({
    subject_class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubjectClass',
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
        max: 50,
        required: true
    }
});

const Weight = mongoose.model('Weight', WeightSchema);
module.exports = Weight