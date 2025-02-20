const mongoose = require('mongoose');

const TeacherSchema = new mongoose.Schema(
    {
        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
        },
        first_name: {
            type: String,
            required: true
        },
        middle_name: {
            type: String,
        },
        last_name: {
            type: String,
            required: true
        },
        sex: {
            type: String,
            required: true,
            default: 'Male',
            enum: ['Male', 'Female']
        },
        email: {
            type: String,
            unique: true,
            sparse: true
        },
        photo: {
            type: String
        },
        uid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            unique:true,
            sparse:true
        },
        is_director: {
            type: Boolean,
            default: false,
            required:true
        },
    }
);

const Teacher = mongoose.model('Teacher', TeacherSchema);
module.exports = Teacher;
