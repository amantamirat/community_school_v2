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
        required: true // Load in hours or credits
    }
});

// Define the grade schema
const GradeSchema = new mongoose.Schema({
    level: {
        type: Number,
        required: true // Example: 1, 2, 3, etc.
    },
    branch: {
        type: String,
        enum: ['GEN', 'NAT', 'SOC'],
        default:'GEN',
        required: true // Branch type for preparatory stage
    },
    subjects: [SubjectSchema] // Array of subjects for this grade level
});

// Define the stage schema
const StageSchema = new mongoose.Schema({
    name: {
        type: String,
        enum: ['KG', 'PRMI', 'PRMII', 'HS', 'PREP'],
        required: true // Example: 'KG', 'PRMI', 'PRMII', 'HS', 'PREP'
    },
    
    grades: {
        type: [GradeSchema]
    }
});

// Define the curriculum schema
const CurriculumSchema = new mongoose.Schema({
    curriculumYear: {
        type: String,
        required: true // Example: '2023-2024'
    },
    maxSemester: {
        type: Number,
        required: true
    },
    admissionClassification: {
        type: String,
        required: true // Example: 'Regular', 'Transfer', etc.
    },
    stages: [
        {
            name: 'KG',
            grades: [
                { level: 1 },
                { level: 2 },
                { level: 3 }
            ]
        },
        {
            name: 'PRMI',
            grades: [
                { level: 1 },
                { level: 2 },
                { level: 3 },
                { level: 4 }
            ]
        },
        {
            name: 'PRMII',
            grades: [
                { level: 5 },
                { level: 6 },
                { level: 7 },
                { level: 8 }
            ]
        },
        {
            name: 'HS',
            grades: [
                { level: 9 },
                { level: 10 }
            ]
        },
        {
            name: 'PREP',
            grades: [
                { level: 11, branch: 'NAT'},
                { level: 11, branch: 'SOC'},
                { level: 12, branch: 'NAT'},                
                { level: 12, branch: 'SOC'}
            ]
        }
    ]
});

// Create the model
const Curriculum = mongoose.model('Curriculum', CurriculumSchema);

module.exports = Curriculum;
