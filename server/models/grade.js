const mongoose = require('mongoose');
// Define the grade schema
const GradeSchema = new mongoose.Schema({
    stage: {
        type: String,
        enum: ['KG', 'PRM_MID', 'PREP'],
        required: true, // Example: 'KG (1-3)', 'PRMMID 1-10', 'PREP 11 NAT , PREP 12 SOC'
        immutable: true
    },
    stage_name: {
        type: String,
        enum: ['KG', 'GRADE'],
        required: true, // Example: 'KG (1-3)', 'PRMMID 1-10', 'PREP 11 NAT , PREP 12 SOC'
        immutable: true
    },
    level: {
        type: Number,
        required: true, // Example: 1, 2, 3, etc.
        immutable: true
    },
    specialization: {
        type: String,
        enum: ['GEN', 'NAT', 'SOC'],
        default: 'GEN',
        required: true, // Specialization type for preparatory stage
        immutable: true
    }
});
GradeSchema.index({ stage_name: 1, level: 1, specialization: 1 }, { unique: true });
GradeSchema.index({ stage: 1, level: 1, specialization: 1 }, { unique: true });
const Grade = mongoose.model('Grade', GradeSchema);
module.exports = Grade;