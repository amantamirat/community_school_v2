const Student = require("../models/student");
const ExternalStudentPriorInfo = require('../models/external-student-info');

const studentController = {

    getAllStudents: async (req, res) => {
        try {
            const students = await Student.find().lean();
            res.status(200).json(students);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error fetching students", error });
        }
    },

    getNewStudents: async (req, res) => {
        try {
            const students = await Student.find({ has_perior_school_info: false, registered: false }).lean();
            res.status(200).json(students);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error fetching students", error });
        }
    },

    createStudent: async (req, res) => {
        //const session = await mongoose.startSession();
        try {
            const { student, external_info } = req.body
            if (student.has_perior_school_info && (external_info === null || !external_info)) {
                return res.status(404).json({ message: "Student External Information Not Found!" });
            }
            //session.startTransaction();
            const { first_name, middle_name, last_name, sex, birth_date, has_perior_school_info } = student;
            const newStudent = new Student({ first_name, middle_name, last_name, sex, birth_date, has_perior_school_info });
            //await newStudent.save({ session });
            await newStudent.save();
            if (has_perior_school_info) {
                const { school_name, academic_year, classification, grade, average_result, status, transfer_reason } = external_info;
                const newInfo = new ExternalStudentPriorInfo({ student: newStudent._id, school_name, academic_year, classification, grade, average_result, status, transfer_reason });
                //await newInfo.save({ session });
                await newInfo.save();
            }
            //await session.commitTransaction();
            //session.endSession();
            res.status(201).json(newStudent);
        } catch (error) {
            //await session.abortTransaction();
            //session.endSession();
            console.log(error);
            res.status(500).json({ message: error.message });
        }
    },

    updateStudent: async (req, res) => {
        try {
            const { id } = req.params;
            const { first_name, middle_name, last_name, sex, birth_date } = req.body;
            const updatedStudent = await Student.findByIdAndUpdate(id, { first_name, middle_name, last_name, sex, birth_date }, { new: true });
            if (!updatedStudent) {
                return res.status(404).json({ message: "Student not found" });
            }
            res.status(200).json(updatedStudent);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: error.message });
        }
    },

    updateStudentPhoto: async (req, res) => {
        try {
            const { id } = req.params;
            if (!req.file) {
                return res.status(400).json({ message: "No file uploaded" });
            }
            const photoPath = `/uploads/students/${req.file.filename}`;

            const updatedStudent = await Student.findByIdAndUpdate(id, { photo: photoPath }, { new: true });

            if (!updatedStudent) {
                return res.status(404).json({ message: "Student not found" });
            }
            
            res.status(200).json(updatedStudent);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: error.message });
        }
    },

    deleteStudent: async (req, res) => {
        try {
            const { id } = req.params;
            const student = await Student.findById(id);
            if (!student) return res.status(404).json({ message: "Student not found" });
            if (student.has_perior_school_info) return res.status(404).json({ message: "The student has External Info." });
            if (student.registered) return res.status(404).json({ message: "The student is registered. Can not delete." });          
            await Student.findByIdAndDelete(id);           
            res.status(200).json({ message: "Student deleted successfully" });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error deleting student", error });
        }
    }
};

module.exports = studentController;
