const mongoose = require('mongoose');
// Define the grade schema
const GradeSchema = new mongoose.Schema({    
    stage: {
        type: String,
        enum: ['KG', 'GRADE'],
        required: true, 
        immutable: true
    },
    level: {
        type: Number,
        required: true, // Example: 1, 2, 3, etc.
        immutable: true
    },
    specialization: {
        type: String,
        enum: ['NAT', 'SOC']
    }
});
GradeSchema.index({ stage: 1, level: 1, specialization: 1 }, { unique: true });
const Grade = mongoose.model('Grade', GradeSchema);
module.exports = Grade;