const StudentClass = require('../models/student-class');
const StudentGrade = require("../models/student-grade");
const GradeSection = require('../models/grade-sections');
const TermClass = require('../models/term-class');
const SectionSubject = require("../models/section-subject");

const StudentClassController = {

    getStudentClassesByStudentGrade: async (req, res) => {
        try {
            const { student_grade } = req.params;
            const studentClasss = await StudentClass.find({ student_grade: student_grade }).populate({
                path: 'term_class',
                populate: { path: 'subject_term', populate: { path: 'grade_subject', populate: { path: 'subject' } } },
            });
            //console.log(studentClasss)
            res.status(200).json(studentClasss);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getStudentClassesBySectionClass: async (req, res) => {
        try {
            const { term_class } = req.params;
            const studentClasss = await StudentClass.find({ term_class: term_class }).populate({
                path: 'student_grade',
                populate: { path: 'student' },
            }).lean();
            //console.log(studentClasss);
            res.status(200).json(studentClasss);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    syncClasses: async (req, res) => {
        try {
            const { grade_section } = req.params;
            const gradeSection = await GradeSection.findById(grade_section);
            if (!gradeSection) {
                return res.status(404).json({ message: 'Grade section not found' });
            }
            if (gradeSection.status === 'CLOSED') {
                return res.status(400).json({ message: 'Section already closed' });
            }
            const studentGrades = await StudentGrade.find({ grade_section: grade_section }).lean();
            const studentGradeIds = studentGrades.map(stud => stud._id);

            const existingStudentClasses = await StudentClass.find({ student_grade: { $in: studentGradeIds } })
                .select('student_grade term_class');

            const studentClassMap = new Map();
            studentGradeIds.forEach(studId => studentClassMap.set(studId.toString(), new Set()));

            existingStudentClasses.forEach(({ student_grade, term_class }) => {
                studentClassMap.get(student_grade.toString()).add(term_class.toString());
            });
            const sectionSubjects = await SectionSubject.find({ grade_section: grade_section });
            const sectionSubjectsIds = sectionSubjects.map(sub => sub._id.toString());
            const termClasses = await TermClass.find({ section_subject: { $in: sectionSubjectsIds } });
            const termClassIds = termClasses.map(term => term._id.toString());

            const newStudentClasses = [];
            studentGradeIds.forEach(studId => {
                const existingClass = studentClassMap.get(studId.toString());
                termClassIds.forEach(termClass => {
                    if (!existingClass.has(termClass)) {
                        newStudentClasses.push({ student_grade: studId, term_class: termClass });
                    }
                });
            });
            const insertedClasses = await StudentClass.insertMany(newStudentClasses);
            res.status(201).json(insertedClasses);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: error.message });
        }
    },

    /*
    // Delete a studentClass by ID
    deleteStudentClass: async (req, res) => {
        try {
            const { id } = req.params;
            const studentClass = await StudentClass.findById(id).populate({ path: 'term_class', populate: { path: 'subject_term', populate: { path: 'grade_subject' } } });
            if (!studentClass) {
                return res.status(400).json({
                    message: 'Student Class Not Found.'
                });
            }
            if (!studentClass.term_class.subject_term.grade_subject.optional) {
                return res.status(400).json({
                    message: 'Cannot delete Non Optional Student Class.'
                });
            }

            //const studentClass = await StudentClass.findById(id);
            if (studentClass.status !== 'ACTIVE') {
                return res.status(400).json({
                    message: 'Cannot delete Non Active Student Class.'
                });
            }
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
    */

};

module.exports = StudentClassController;
