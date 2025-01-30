const mongoose = require('mongoose');
const SubjectTermSchema = new mongoose.Schema({
    grade_subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GradeSubject',
        required: true,
        immutable: true
    },
    term: {
        type: Number,
        min: 1,
        max: 4,
        required: true,
        immutable: true
    },
});
SubjectTermSchema.index({ grade_subject: 1, term: 1 }, { unique: true });
const SubjectTerm = mongoose.model('SubjectTerm', SubjectTermSchema);
module.exports = SubjectTerm