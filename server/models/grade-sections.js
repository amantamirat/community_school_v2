const mongoose = require('mongoose');

const GradeSectionSchema = new mongoose.Schema({
    classification_grade: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClassificationGrade',
        required: true,
        immutable: true,
    },
    section_number: {
        type: Number,
        required: true,
        immutable: true
    },
    number_of_seat: {
        type: Number,
        required: true,
        default:60,
        min: 1,
        max: 200
    },
    status: {
        type: String,
        enum: ['OPEN', 'CLOSED'],
        default: 'OPEN',
        required: true
    }
});

GradeSectionSchema.index({ classification_grade: 1, section_number: 1 }, { unique: true });
const GradeSection = mongoose.model('GradeSection', GradeSectionSchema);
module.exports = GradeSection;