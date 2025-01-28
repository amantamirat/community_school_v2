const mongoose = require('mongoose');
const TermClassSchema = new mongoose.Schema({
    section_class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SectionClass',
        required: true,
        immutable: true
    },
    term: {
        type: Number,
        min: 1,
        max: 4,
        required: true,
        immutable: true
    }
});
TermClassSchema.index({ section_class: 1, term: 1 }, { unique: true });
const TermClass = mongoose.model('TermClass', TermClassSchema);
module.exports = TermClass