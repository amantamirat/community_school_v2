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
        required: true
    },
    grades: [{
        grade: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Grade",
        },
        subjects: [{
            subject: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Subject",
            }
        }
        ]
    }]
});

// Create the model
const Curriculum = mongoose.model('Curriculum', CurriculumSchema);
module.exports = Curriculum;
