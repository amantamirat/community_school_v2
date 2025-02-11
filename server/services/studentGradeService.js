const StudentGrade = require("../models/student-grade");
const StudentClass = require('../models/student-class');

const CurriculumGrade = require("../models/curriculum-grade");

const determineStudentStatus = async (classificationGrade) => {
    try {
        const curriculumGrade = await CurriculumGrade.findById(classificationGrade.curriculum_grade).populate('curriculum');
        if (!curriculumGrade || !curriculumGrade.curriculum) {
            throw new Error("Curriculum or curriculum grade not found.");
        }
        const passMark = curriculumGrade.curriculum.minimum_pass_mark;
        const studentGrades = await StudentGrade.find({ classification_grade: classificationGrade._id });

        if (studentGrades.length === 0) throw new Error("No students to process."); 

        const studentGradeIds = studentGrades.map(studGrd => studGrd._id);
        const studentClasses = await StudentClass.find({ student_grade: { $in: studentGradeIds } }).lean();

        // Organize student classes by student_grade
        const studentGradeClasses = studentClasses.reduce((acc, studentClass) => {
            if (!acc[studentClass.student_grade]) {
                acc[studentClass.student_grade] = [];
            }
            acc[studentClass.student_grade].push(studentClass);
            return acc;
        }, {});

        const studentGradeUpdates = [];

        for (const studentGradeId of studentGradeIds) {
            const studentClass = studentGradeClasses[studentGradeId] || []; // Ensure it's an array
            if (studentClass.length === 0) continue; // Skip students with no classes

            let totalSum = 0;
            let status = 'PASSED';

            for (const studClass of studentClass) {
                if (studClass.status === 'INCOMPLETE') {
                    status = "INCOMPLETE";
                }
                totalSum += studClass.total_result || 0; // Ensure valid number
            }

            const average_result = studentClass.length > 0 ? totalSum / studentClass.length : 0;

            studentGradeUpdates.push({
                updateOne: {
                    filter: { _id: studentGradeId },
                    update: {
                        status: status === 'INCOMPLETE' ? 'INCOMPLETE' : average_result >= passMark ? "PASSED" : "FAILED",
                        average_result: average_result
                    }
                }
            });
        }

        if (studentGradeUpdates.length > 0) {
            await StudentGrade.bulkWrite(studentGradeUpdates);
        }

    } catch (error) {
        console.error("Error in determineStudentStatus:", error);
        throw error;
    }
};


module.exports = {
    determineStudentStatus
};