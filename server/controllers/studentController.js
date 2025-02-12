const Student = require("../models/student");
const ExternalStudentPriorInfo = require('../models/external-student-info');
const StudentGrade = require("../models/student-grade");
const ClassificationGrade = require('../models/classification-grade');
const { removePhoto } = require('../services/photoService');
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
        try {
            const { student, external_info } = req.body
            if (student.has_perior_school_info && (external_info === null || !external_info)) {
                return res.status(404).json({ message: "Student External Information Not Found!" });
            }
            const { first_name, middle_name, last_name, sex, birth_date, has_perior_school_info } = student;
            const newStudent = new Student({ first_name, middle_name, last_name, sex, birth_date, has_perior_school_info });
            await newStudent.save();
            if (has_perior_school_info) {
                const { school_name, academic_year, classification, grade, average_result, status, transfer_reason } = external_info;
                const newInfo = new ExternalStudentPriorInfo({ student: newStudent._id, school_name, academic_year, classification, grade, average_result, status, transfer_reason });
                await newInfo.save();
            }
            res.status(201).json(newStudent);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: error.message });
        }
    },

    registerFirstLevelStudents: async (req, res) => {
        try {
            const candidate_students = req.body;
            if (!Array.isArray(candidate_students)) return res.status(404).json({ message: "Non array students provided." });
            const { classification_grade } = req.params;
            const classificationGrade = await ClassificationGrade.findById(classification_grade).populate({
                path: 'curriculum_grade',
                populate: { path: 'grade', },
            });
            if (!classificationGrade) return res.status(404).json({ message: "Classification Grade not found" });
            if (classificationGrade.status === 'CLOSED') return res.status(404).json({ message: 'Can not register students, Grade is CLOSED' });

            const currentGrade = classificationGrade.curriculum_grade.grade;
            if (currentGrade.level !== 1) return res.status(404).json({ message: 'Non First Level Grade Provided.' });

            const students = await Student.find({ _id: { $in: candidate_students } }).lean();
            if (candidate_students.length !== students.length) return res.status(404).json({ message: "No valid student information found." });

            const student_grades = [];
            const reg_students = [];
            for (const student of students) {
                if (!student.has_perior_school_info && !student.registered) {
                    student_grades.push({
                        student: student._id,
                        classification_grade: classificationGrade._id
                    });
                    reg_students.push(student._id);
                }
            }
            if (!student_grades.length) return res.status(400).json({ message: "No students eligible for registration." });

            await Promise.all([
                StudentGrade.insertMany(student_grades),
                Student.updateMany({ _id: { $in: reg_students } }, { $set: { registered: true } })
            ]);
            res.status(201).json(reg_students);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error registering students" + error });
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
            const student = await Student.findById(id);
            if (!student) return res.status(404).json({ message: "Student not found" });

            if (student.photo) {  //remove old photo
                await removePhoto(student.photo);
            }
            student.photo = `/uploads/students/${req.file.filename}`;
            const updatedStudent = await student.save();
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
            if (student.photo) {
                await removePhoto(student.photo);
            }
            await Student.findByIdAndDelete(id);
            res.status(200).json({ message: "Student deleted successfully" });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error deleting student", error });
        }
    }
};

module.exports = studentController;
