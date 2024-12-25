const mongoose = require('mongoose');
// Class Schema
const SectionClassSchema = new mongoose.Schema({
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
    }],
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StudentClass',
    }]
});
// the model
const SectionClass = mongoose.model('SectionClass', SectionClassSchema);
module.exports = SectionClass