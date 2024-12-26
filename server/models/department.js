const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        index: { unique: true }
    },
    teachers: [{
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teacher",
        }
    }]
});
DepartmentSchema.index({ name: 1 }, { unique: true });
const Department = mongoose.model('Department', DepartmentSchema);
module.exports = Department;