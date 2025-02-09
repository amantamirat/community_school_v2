const StudentClass = require('../models/student-class');
const SectionSubject = require("../models/section-subject");
const TermClass = require("../models/term-class");
const StudentResult = require("../models/student-result");

const registerStudentClasses = async (gradeSection, studentGrades) => {
    try {
        const sectionSubjectsIds = await SectionSubject.distinct('_id', { grade_section: gradeSection._id });
        const termClasses = await TermClass.find({ section_subject: { $in: sectionSubjectsIds } }).lean();
        const restricted = termClasses.some((term) => term.status === 'SUBMITTED' || term.status === 'APPROVED');
        if (restricted) {
            throw new Error('Submitted or Approved Classes Found.');
        }
        const newStudentTermClasses = studentGrades.flatMap(studGrd =>
            termClasses.map(secTerm => ({
                student_grade: studGrd._id,
                term_class: secTerm._id,
                status: 'ACTIVE'
            }))
        );
        return await StudentClass.insertMany(newStudentTermClasses);
    } catch (error) {
        throw error
    }
};

const removeStudentClasses = async (studentGradesIds) => {
    try {
        const studentClassIds = await StudentClass.distinct("_id", { student_grade: { $in: studentGradesIds } });
        const resultsExist = await StudentResult.exists({ student_class: { $in: studentClassIds}});
         if (resultsExist) {
            throw new Error("Some students have results and cannot be detached.");
        }
        return await StudentClass.deleteMany({ student_grade: { $in: studentGradesIds } });
    } catch (error) {        
        throw error        
    }
};

module.exports = {
    registerStudentClasses, removeStudentClasses
};