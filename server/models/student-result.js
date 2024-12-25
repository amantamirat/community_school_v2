const mongoose = require('mongoose');
const StudentResultSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    results: [{
        weight: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Weight',
            required: true
        },
        result: {
            type: Number,
            min: 0,
            max: 50,
            required: true
        }
    }]
});

const StudentResult = mongoose.model('StudentResult', StudentResultSchema);
module.exports = StudentResult