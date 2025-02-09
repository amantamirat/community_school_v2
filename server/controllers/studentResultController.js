const StudentResult = require("../models/student-result");
const StudentClass = require('../models/student-class');
const TermClass = require("../models/term-class");

const StudentResultController = {

    getStudentResultsByTermClass: async (req, res) => {
        try {
            const { term_class } = req.params;
            const studentClassIds = await StudentClass.distinct('_id', { term_class: term_class });
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
            const { term_class } = req.params;
            const termClass = await TermClass.findById(term_class);
            if (!termClass) return res.status(404).json({ message: 'Term class not found' });
            if (termClass.status !== "ACTIVE") return res.status(400).json({ message: 'Only ACTIVE section classes results can be updated' });

            const student_results = req.body;
            if (!Array.isArray(student_results) || student_results.length === 0) {
                return res.status(400).json({ message: 'Invalid input data. subject_results must be a non-empty array.' });
            }
            const studentClassIds = student_results.map(r => r.student_class);
            const studentClasses = await StudentClass.find({ _id: { $in: studentClassIds } }).lean();
            const invalidStudent = studentClasses.some(sc => sc.term_class.toString() !== term_class.toString());
            if (invalidStudent) return res.status(400).json({ message: 'Some students are not in the section(term) class' });

            const operations = student_results.map(async (result) => {
                const { student_class, subject_weight, result: score } = result;
                if (!student_class || !subject_weight || typeof score !== 'number') {
                    throw new Error('Missing required fields: student_class, subject_weight, or result.');
                }
                //closed results...?
                return StudentResult.updateOne(
                    { student_class, subject_weight },
                    { $set: { result: score } },
                    { upsert: true }
                );
            });
            const results = await Promise.all(operations);
            return res.status(201).json(results);
        } catch (error) {
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
                return res.status(403).json({ message: 'Deletion not allowed for CLOSED results.' });
            }
            await studentResult.deleteOne();
            res.status(200).json({ message: 'Student Result deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
};

module.exports = StudentResultController;
