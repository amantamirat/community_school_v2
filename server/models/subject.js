const mongoose = require('mongoose');
// Define the subject schema
const SubjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    load: {
        type: Number,
        required: true // Load in hours or credits per week
    },
    elective: {
        type: Boolean,
        default: false,
        required: true,
    },
    optional: {
        type: Boolean,
        default: false,
        required: true,
    }
});

// Create the model
const Subject = mongoose.model('Subject', SubjectSchema);
module.exports = Subject;