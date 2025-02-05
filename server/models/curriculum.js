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
        min: 1,
        max: 4,
        required: true
    },
    maximum_point: {
        type: Number,
        default: 100,
        required: true,
        max: 500
    },
    minimum_pass_mark: {
        type: Number,
        default: 50,
        required: true
    },
    maximum_load: {
        type: Number,
        default: 40,
        required: true,
        max: 80
    },

},
    {
        timestamps: true // Automatically adds `createdAt` and `updatedAt` fields
    }
);
// Create the model
const Curriculum = mongoose.model('Curriculum', CurriculumSchema);
module.exports = Curriculum;
