const mongoose = require('mongoose');

const GradeSectionSchema = new mongoose.Schema({
    grade: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Grade',
        required: true
    },
    section: {
        type: Number,
        required: true
    }
});
// Create the model
const GradeSection = mongoose.model('GradeSection', GradeSectionSchema);
module.exports = GradeSection;