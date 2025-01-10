const mongoose = require('mongoose');

const TeacherClassSchema = new mongoose.Schema({
    subject_class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SectionClass',
        required: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
        required: true
    }
});

const TeacherClass = mongoose.model('TeacherClass', TeacherClassSchema);
module.exports = TeacherClass