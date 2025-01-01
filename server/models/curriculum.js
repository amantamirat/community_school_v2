// Import Mongoose
const mongoose = require('mongoose');
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
        required: true,
        min: [0, "Pass mark must be at least 0"],
        max: [100, "Pass mark cannot exceed 100"]
    },
    grade_subjects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "GradeSubject", // Reference to the GradeSubject collection
        required: true
    }]
},
    {
        timestamps: true // Automatically adds `createdAt` and `updatedAt` fields
    }
);

// Create the model
const Curriculum = mongoose.model('Curriculum', CurriculumSchema);
module.exports = Curriculum;
