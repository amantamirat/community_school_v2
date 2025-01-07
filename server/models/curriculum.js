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
    number_of_terms: {
        type: Number,
        default: 2,
        required: true
    },
    maximum_point: {
        type: Number,
        required: true
    },
    minimum_pass_mark: {
        type: Number,
        required: true
    },
    
},
    {
        timestamps: true // Automatically adds `createdAt` and `updatedAt` fields
    }
);
// Create the model
const Curriculum = mongoose.model('Curriculum', CurriculumSchema);
module.exports = Curriculum;
