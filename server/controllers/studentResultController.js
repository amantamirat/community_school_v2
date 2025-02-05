const StudentResult = require("../models/student-result");
const SectionClass = require("../models/section-class");
const StudentClass = require('../models/student-class');
const SubjectTerm = require('../models/subject-term');
const SubjectWeight = require('../models/subject-weight');

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

    submitStudentResultsBySectionClass: async (req, res) => {
        try {
            const { section_class } = req.params;
            // Find and validate section class
            const sectionClass = await SectionClass.findById(section_class);
            if (!sectionClass) return res.status(404).json({ message: 'Section class not found' });
            if (sectionClass.status !== "ACTIVE") return res.status(400).json({ message: 'Section class is not ACTIVE' });
            //subject term
            const subjectTerm = await SubjectTerm.findById(sectionClass.subject_term);
            if (!subjectTerm) return res.status(404).json({ message: 'Subject Term is not found.' });
            //subject weights
            const subjectWeightIds = await SubjectWeight.distinct('_id', { grade_subject: subjectTerm.grade_subject });
            if (subjectWeightIds.length === 0) return res.status(400).json({ message: 'No weights are found in the subject' });
            //student classes
            const studentClasses = await StudentClass.find({ section_class: section_class });
            if (studentClasses.length === 0) return res.status(400).json({ message: 'No students found in this section class' });
            const studentClassIds = studentClasses.map(sc => sc._id);
            //results
            const studentResults = await StudentResult.find({ student_class: { $in: studentClassIds } });
            if (studentResults.length === 0) return res.status(400).json({ message: 'No students found in this section class' });

            const studentResultsMap = new Map();
            for (const result of studentResults) {
                if (!studentResultsMap.has(result.student_class.toString())) {
                    studentResultsMap.set(result.student_class.toString(), new Set());
                }
                studentResultsMap.get(result.student_class.toString()).add(result.subject_weight.toString());
            }

            // Prepare bulk updates for student classes
            const bulkStudentClassUpdates = [];
            const bulkStudentResultUpdates = [];

            for (const studentClass of studentClasses) {
                const studentResultSubjectWeightIds = studentResultsMap.get(studentClass._id.toString()) || new Set();
                const allSubjectsPresent = subjectWeightIds.every(id => studentResultSubjectWeightIds.has(id.toString()));
                bulkStudentClassUpdates.push({
                    updateOne: {
                        filter: { _id: studentClass._id },
                        update: { status: allSubjectsPresent ? 'COMPLETED' : 'INCOMPLETE' }
                    }
                });
                bulkStudentResultUpdates.push({
                    updateMany: {
                        filter: { student_class: studentClass._id },
                        update: { status: 'CLOSED' }
                    }
                });
            }
            // Perform bulk updates
            if (bulkStudentClassUpdates.length > 0) await StudentClass.bulkWrite(bulkStudentClassUpdates);
            if (bulkStudentResultUpdates.length > 0) await StudentResult.bulkWrite(bulkStudentResultUpdates);
            // Update section class status
            await SectionClass.updateOne({ _id: section_class }, { status: 'SUBMITTED' });
            return res.status(200).json({ message: 'Results submitted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },


    activateStudentResultsBySectionClass: async (req, res) => {
        try {
            const { section_class } = req.params;
            // Find and validate section class
            const sectionClass = await SectionClass.findById(section_class);
            if (!sectionClass) return res.status(404).json({ message: 'Section class not found' });
            if (sectionClass.status !== "SUBMITTED") return res.status(400).json({ message: 'Only SUBMITTED section classes can be activated' });

            // Retrieve student classes
            const studentClasses = await StudentClass.find({ section_class: section_class });
            if (studentClasses.length === 0) return res.status(400).json({ message: 'No students found in this section class' });

            const studentClassIds = studentClasses.map(sc => sc._id);

            // Prepare bulk updates
            const bulkStudentClassUpdates = studentClassIds.map(id => ({
                updateOne: {
                    filter: { _id: id },
                    update: { status: 'ACTIVE' }
                }
            }));

            const bulkStudentResultUpdates = studentClassIds.map(id => ({
                updateMany: {
                    filter: { student_class: id },
                    update: { status: 'ACTIVE' }
                }
            }));

            // Perform bulk updates
            if (bulkStudentClassUpdates.length > 0) await StudentClass.bulkWrite(bulkStudentClassUpdates);
            if (bulkStudentResultUpdates.length > 0) await StudentResult.bulkWrite(bulkStudentResultUpdates);

            // Update section class status back to ACTIVE
            await SectionClass.updateOne({ _id: section_class }, { status: 'ACTIVE' });

            return res.status(200).json({ message: 'Results activation successful, everything is back to active state' });

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
            const { section_class } = req.params;
            const sectionClass = await SectionClass.findById(section_class);
            if (!sectionClass) return res.status(404).json({ message: 'Section class not found' });
            if (sectionClass.status !== "ACTIVE") return res.status(400).json({ message: 'Only ACTIVE section classes results can be updated' });

            const student_results = req.body;
            if (!Array.isArray(student_results) || student_results.length === 0) {
                return res.status(400).json({ message: 'Invalid input data. subject_results must be a non-empty array.' });
            }
            const studentClassIds = student_results.map(r => r.student_class);
            const studentClasses = await StudentClass.find({ _id: { $in: studentClassIds } }).lean();
            const invalidStudent = studentClasses.some(sc => sc.section_class.toString() !== section_class.toString());
            if (invalidStudent) return res.status(400).json({ message: 'Some students are not in the section class' });
            
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
