const mongoose = require('mongoose');
const StudentResultSchema = new mongoose.Schema({
    student_class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StudentClass',
        required: true
    },    
    subject_weight: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubjectWeight',
        required: true
    },
    result: {
        type: Number,
        min: 0,
        max: 100,
        required: true
    },
    term: {
        type: Number,
        min: 1,
        max: 4,
        required: true
    }
});
StudentResultSchema.index({ student_class: 1, subject_weight: 1 }, { unique: true });
const StudentResult = mongoose.model('StudentResult', StudentResultSchema);
module.exports = StudentResult