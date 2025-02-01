const StudentClass = require('../models/student-class');
const StudentResult = require("../models/student-result");

const StudentResultController = {

    getStudentResultsBySectionClass: async (req, res) => {
        try {
            const { section_class } = req.params;
            const studentClasses = await StudentClass.find({ section_class: section_class });
            const studentClassIds = studentClasses.map((studentClass) => studentClass._id);
            const studentResults = await StudentResult.find({ student_class: { $in: studentClassIds } });
            return res.status(200).json(studentResults);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },


    getStudentResultsByStudentClass: async (req, res) => {
        try {
            const { student_class } = req.params;
            const studentResults = await StudentResult.find({ student_class: student_class }).populate('subject_weight');
            return res.status(200).json(studentResults);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },


    updateStudentResults: async (req, res) => {
        try {
            const student_results = req.body;
            if (!Array.isArray(student_results) || student_results.length === 0) {
                return res.status(400).json({ message: 'Invalid input data. subject_results must be a non-empty array.' });
            }
            const operations = student_results.map(async (result) => {
                const { student_class, subject_weight, result: score } = result;
                if (!student_class || !subject_weight || typeof score !== 'number') {
                    throw new Error('Missing required fields: student_class, subject_weight, or result.');
                }
                const studentResult = await StudentResult.findOne({ student_class, subject_weight });
                if (studentResult && studentResult.status === 'CLOSED') {
                    throw new Error(
                        `Update not allowed for CLOSED record with student_class: ${student_class} and subject_weight: ${subject_weight}.`
                    );
                }
                return StudentResult.updateOne(
                    { student_class, subject_weight },
                    { $set: { result: score } },
                    { upsert: true }
                );
            });
            const results = await Promise.all(operations);
            return res.status(201).json(results);
        } catch (error) {
            //console.error(error);
            return res.status(500).json({ message: error.message });
        }
    },


    deleteStudentResult: async (req, res) => {
        try {
            const { id } = req.params;
            const studentResult = await StudentResult.findById(id);
            if (!studentResult) {
                return res.status(404).json({ message: 'Student Result not found' });
            }
            // Check if the status is CLOSED
            if (studentResult.status === 'CLOSED') {
                return res.status(403).json({ message: 'Deletion not allowed for CLOSED records.' });
            }
            await studentResult.deleteOne();
            res.status(200).json({ message: 'Student Result deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
};

module.exports = StudentResultController;
