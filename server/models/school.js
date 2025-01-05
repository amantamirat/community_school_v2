const mongoose = require('mongoose');

const SchoolSchema = new mongoose.Schema({
    school_name: {
        type: String,
        required: true,
        index: { unique: true }
    }
});

const School = mongoose.model('School', SchoolSchema);
module.exports = School;