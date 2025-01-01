const mongoose = require('mongoose');
// Define the subject schema
const SubjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    load: {
        type: Number,
        required: true,
        min: 1, // Load in hours or credits per week
        max: 7
    },
    optional: {
        type: Boolean,
        default: false, //Optional Subjects can be more than one and selected by students
        required: true,
    }
});

// Create the model
const Subject = mongoose.model('Subject', SubjectSchema);
module.exports = Subject;