const SectionSubject = require('../models/section-subject');
const SubjectTerm = require('../models/subject-term');
const TermClass = require('../models/term-class');
const SubjectWeight = require('../models/subject-weight');
const StudentClass = require('../models/student-class');
const StudentResult = require("../models/student-result");


const TermClassController = {
    
    getTermClassBySubject: async (req, res) => {
        try {
            const { section_subject } = req.params;
            const termClasses = await TermClass.find({ section_subject: section_subject })
                .populate({
                    path: 'subject_term',
                    populate: { path: 'grade_subject', populate: { path: 'subject', } },
                }).lean();
            res.status(200).json(termClasses);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },


    submitTermClass: async (req, res) => {
        try {
            const { term_class } = req.params;
            const termClass = await TermClass.findById(term_class);
            if (!termClass) return res.status(404).json({ message: 'Section class not found' });
            if (termClass.status !== "ACTIVE") return res.status(400).json({ message: 'Section class is not ACTIVE' });

            const subjectTerm = await SubjectTerm.findById(termClass.subject_term);
            if (!subjectTerm) return res.status(404).json({ message: 'Subject Term is not found.' });

            const subjectWeightIds = await SubjectWeight.distinct('_id', { grade_subject: subjectTerm.grade_subject });
            if (subjectWeightIds.length === 0) return res.status(400).json({ message: 'No weights are found in the subject' });

            const studentClasses = await StudentClass.find({ term_class: term_class });
            if (studentClasses.length === 0) return res.status(400).json({ message: 'No students found in this section class' });
            const studentClassIds = studentClasses.map(sc => sc._id);

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
            if (bulkStudentClassUpdates.length > 0) await StudentClass.bulkWrite(bulkStudentClassUpdates);
            if (bulkStudentResultUpdates.length > 0) await StudentResult.bulkWrite(bulkStudentResultUpdates);

            termClass.status = "SUBMITTED";
            const savedTermClass = await termClass.save();
            return res.status(200).json(savedTermClass);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    activateTermClass: async (req, res) => {
        try {
            const { term_class } = req.params;
            const termClass = await TermClass.findById(term_class);
            if (!termClass) return res.status(404).json({ message: 'Section class not found' });
            if (termClass.status !== "SUBMITTED") return res.status(400).json({ message: 'Only SUBMITTED section classes can be activated' });

            
            const studentClasses = await StudentClass.find({ term_class: term_class });
            if (studentClasses.length === 0) return res.status(400).json({ message: 'No students found in this section class' });

            const studentClassIds = studentClasses.map(sc => sc._id);
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
            if (bulkStudentClassUpdates.length > 0) await StudentClass.bulkWrite(bulkStudentClassUpdates);
            if (bulkStudentResultUpdates.length > 0) await StudentResult.bulkWrite(bulkStudentResultUpdates);
            
            termClass.status = "ACTIVE";
            const savedTermClass = await termClass.save();
            return res.status(200).json(savedTermClass);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    approveTermClass: async (req, res) => {
        try {
            const { term_class } = req.params;
            const termClass = await TermClass.findById(term_class).populate('subject_term');
            if (!termClass) return res.status(404).json({ message: 'Term class not found' });
            if (termClass.status !== "SUBMITTED") return res.status(400).json({ message: 'Only SUBMITTED term classes can be approved' });
            const nextSubjectTerm = await SubjectTerm.findOne({ grade_subject: termClass.subject_term.grade_subject, term: termClass.subject_term.term + 1 }).lean();
            if (nextSubjectTerm) {
                const nextTermClass = await TermClass.findOne({ section_subject: termClass.section_subject, subject_term: nextSubjectTerm._id });
                if (nextTermClass) {
                    nextTermClass.status = "ACTIVE";
                    await nextTermClass.save();
                }
            } else {
                const sectionSubject = await SectionSubject.findById(termClass.section_subject);
                if (sectionSubject) {
                    sectionSubject.status = "CLOSED";
                    await sectionSubject.save();
                }
            }
            termClass.status = "APPROVED";
            const savedTermClass = await termClass.save();
            res.status(200).json(savedTermClass);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: error.message });
        }
    },

    revokeTermClass: async (req, res) => {
        try {
            const { term_class } = req.params;
            const termClass = await TermClass.findById(term_class).populate('subject_term');
            if (!termClass) return res.status(404).json({ message: 'Term class not found' });
            if (termClass.status !== "APPROVED") return res.status(400).json({ message: 'Only APPROVED term classes can be Revoked' });
            const nextSubjectTerm = await SubjectTerm.findOne({ grade_subject: termClass.subject_term.grade_subject, term: termClass.subject_term.term + 1 }).lean();
            if (nextSubjectTerm) {
                const nextTermClass = await TermClass.findOne({ section_subject: termClass.section_subject, subject_term: nextSubjectTerm._id });
                //results are closed...., sections are closed .....
                if (nextTermClass) {
                    if(nextTermClass.status!=="ACTIVE"){
                        return res.status(400).json({ message: 'Can Not Revoke this Class, Next Term is not active!' });
                    }
                    nextTermClass.status = "PENDING";
                    await nextTermClass.save();
                }
            } else {
                const sectionSubject = await SectionSubject.findById(termClass.section_subject);
                if (sectionSubject) {
                    sectionSubject.status = "ACTIVE";
                    await sectionSubject.save();
                }
            }
            termClass.status = "SUBMITTED";
            const savedTermClass = await termClass.save();
            res.status(200).json(savedTermClass);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: error.message });
        }
    },
};

module.exports = TermClassController;

