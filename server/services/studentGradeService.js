const StudentGrade = require("../models/student-grade");
const StudentClass = require('../models/student-class');

const determineStudentStatus = async (classificationGrade) => {
    try {
        const studentGrades = await StudentGrade.find({ classification_grade: classificationGrade._id });
        const studentGradeIds = studentGrades.map(studGrd => studGrd._id);
        const studentClasses = await StudentClass.find({ student_grade: { $in: studentGradeIds } }).lean();
        const studentGradeClass = studentClasses.reduce((acc, studentClass) => {
            if (!acc[studentClass.student_grade]) {
                acc[studentClass.student_grade] = [];
            }
            acc[studentClass.student_grade].push(studentClass);
            return acc;
        }, {});
        
    } catch (error) {
        throw error
    }
};

module.exports = {
    determineStudentStatus
};