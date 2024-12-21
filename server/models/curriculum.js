// Import Mongoose
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

// Define the grade schema
const GradeSchema = new mongoose.Schema({
    stage: {
        type: String,
        enum: ['KG', 'PRM_MID', 'PREP'],
        required: true // Example: 'KG (1-3)', 'PRMMID 1-10', 'PREP 11 NAT , PREP 12 SOC'
    },
    level: {
        type: Number,
        required: true // Example: 1, 2, 3, etc.
    },
    specialization: {
        type: String,
        enum: ['GEN', 'NAT', 'SOC'],
        default: 'GEN',
        required: true // Specialization type for preparatory stage
    }
});



// Define the curriculum schema
const CurriculumSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true // Short Title Example: 'Curriculum of Ministsrty of Education for Kids 2012'
    },
    minimum_load: {
        type: Number,
        required: true
    },
    maximum_load: {
        type: Number,
        required: true
    },
    minimum_pass_mark: {
        type: Number,
        required: true
    },
    grades: [{
        grade: {
            type: GradeSchema
        },
        subjects: [SubjectSchema]
    }]
});

// Create the model
const Curriculum = mongoose.model('Curriculum', CurriculumSchema);

module.exports = Curriculum;
