const mongoose = require('mongoose');

const GradeSectionSchema = new mongoose.Schema({
    academic_session: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AcademicSession',
        required: true
    },
    grade: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Grade',
        required: true
    },
    sections: [{
        section: {
            type: Number,
            required: true
        },
        classes: [{
            section_class: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'SectionClass',
                required: true
            }
        }]
    }]
});
// Create the model
const GradeSection = mongoose.model('GradeSection', GradeSectionSchema);
module.exports = GradeSection;