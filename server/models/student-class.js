const mongoose = require('mongoose');
const StudentClassSchema = new mongoose.Schema({
    section_class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SectionClass',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    }
});

const StudentClass = mongoose.model('StudentClass', StudentClassSchema);
module.exports = StudentClass