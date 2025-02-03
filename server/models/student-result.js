const mongoose = require('mongoose');
const StudentResultSchema = new mongoose.Schema({
    student_class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StudentClass',
        required: true,
        immutable: true,
    },
    subject_weight: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubjectWeight',
        required: true,
        immutable: true,
    },
    result: {
        type: Number,
        min: 0,
        max: 100,
        required: true
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'CLOSED'],
        default: 'ACTIVE',
        required: true
    }
});
StudentResultSchema.index({ student_class: 1, subject_weight: 1 }, { unique: true });
const StudentResult = mongoose.model('StudentResult', StudentResultSchema);
module.exports = StudentResult