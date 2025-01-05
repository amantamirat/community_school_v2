// Import Mongoose
const mongoose = require('mongoose');
// Define the curriculum schema
const CurriculumSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true // Short Title Example: 'Curriculum of Ministsrty of Education for Kids 2012'
    },
    classification: {
        type: String,
        enum: ['REGULAR', 'EVENING', 'DISTANCE'], // Refers to Regular, Night, and Distance
        default: 'REGULAR',
        required: true
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
    grades: [{
        grade: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Grade",
            required: true
        },
        subjects: [{
            subject: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Subject",
                required: true
            }
        }]
    }]
},
    {
        timestamps: true // Automatically adds `createdAt` and `updatedAt` fields
    }
);
// Create the model
const Curriculum = mongoose.model('Curriculum', CurriculumSchema);
module.exports = Curriculum;
