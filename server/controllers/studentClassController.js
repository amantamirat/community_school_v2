const StudentClass = require('../models/student-class');
const StudentGrade = require("../models/student-grade");
const StudentResult = require("../models/student-result");

const StudentClassController = {

    syncStudentClasses: async (req, res) => {
        try {
            const { student_grade } = req.params;
            const studentGrade = await StudentGrade.findById(student_grade);
            if (!studentGrade) {
                return res.status(404).json({ message: 'Student Grade not found' });
            }
            res.status(201).json({});
        } catch (error) {
            res.status(400).json({ message: error.message });
            //console.log(error);
        }
    },

    getStudentClasses: async (req, res) => {
        try {
            const { student_grade } = req.params;
            //console.log("**")
            const studentClasss = await StudentClass.find({ student_grade: student_grade }).populate({
                path: 'section_class',
                populate: { path: 'grade_subject', populate: { path: 'subject' } },
            });
            res.status(200).json(studentClasss);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Delete a studentClass by ID
    deleteStudentClass: async (req, res) => {
        try {
            const { id } = req.params;
            const isReferencedInStudentResult = await StudentResult.exists({ student_class: id });
            if (isReferencedInStudentResult) {
                return res.status(400).json({
                    message: 'Cannot delete Student Class, it is referenced in Result.'
                });
            }
            const deletedStudentClass = await StudentClass.findByIdAndDelete(id);
            if (!deletedStudentClass) {
                return res.status(404).json({ message: 'Student Class not found' });
            }
            res.status(200).json({ message: 'Student Class deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
};

module.exports = StudentClassController;
