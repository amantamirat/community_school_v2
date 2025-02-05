const mongoose = require('mongoose');

const TermClassSchema = new mongoose.Schema({
    section_subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SectionSubject',
        required: true,
        immutable: true,
    },
    subject_term: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubjectTerm',
        required: true,
        immutable: true
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'SUBMITTED', 'APPROVED', 'PENDING'],
        default: 'ACTIVE',
        required: true
    }
});
TermClassSchema.index({ section_subject: 1, subject_term: 1 }, { unique: true });
const TermClass = mongoose.model('TermClass', TermClassSchema);
module.exports = TermClass