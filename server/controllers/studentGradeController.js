const StudentGrade = require("../models/student-grade");
const ExternalStudentPriorInfo = require('../models/external-student-info');
const ClassificationGrade = require('../models/classification-grade');
const gradeController = require('../controllers/gradeController');
const studentGradeController = {
    registerExternalStudents: async (req, res) => {
        try {
            const { classification_grade } = req.params;
            const classificationGrade = await ClassificationGrade.findById(classification_grade).populate({
                path: 'curriculum_grade',
                populate: {
                    path: 'grade',
                },
            });
            if (!classificationGrade) {
                return res.status(404).json({ message: "Classification Grade not found" });
            }
            const current_grade = classificationGrade.curriculum_grade.grade;
            const prev_grade = await gradeController.getPreviousGrade(current_grade.stage, current_grade.level, current_grade.specialization);
            if (!prev_grade) {
                return res.status(404).json({ message: 'Previous Grade not found, for' + current_grade.stage + '-' + current_grade.level });
            }
            const candidate_external_students = req.body;
            const student_grades = [];
            const external_info_updates = []; // promises
            if (Array.isArray(candidate_external_students)) {
                for (const cadidate of candidate_external_students) {
                    const externalInfo = await ExternalStudentPriorInfo.findById(cadidate);
                    if (!externalInfo) {
                        return res.status(404).json({ message: "Non External Student Information Found (Invalid Data)." });
                    }
                    if (externalInfo.status === 'PASSED') {
                        if (!externalInfo.grade.equals(prev_grade._id)) {
                            continue;
                        }
                    } else if (externalInfo.status === 'FAILED') {
                        if (!externalInfo.grade.equals(current_grade._id)) {
                            continue;
                        }
                    } else {
                        continue;
                    }
                    const student_grade = new StudentGrade({
                        classification_grade: classificationGrade._id,
                        student: externalInfo.student,
                        external_student_prior_info: externalInfo._id
                    });
                    student_grades.push(student_grade);
                    external_info_updates.push(externalInfo._id);
                }
            } else {
                res.status(404).json({ message: "Non Array Students Found Error registering students" });
            }
            const saved_student_grades = await StudentGrade.insertMany(student_grades);
            await ExternalStudentPriorInfo.updateMany(
                { _id: { $in: external_info_updates } },
                { $set: { is_registred: true } }
            );
            res.status(201).json(saved_student_grades);
        } catch (error) {
            //console.log(error);
            res.status(500).json({ message: "Error registering students" + error });
        }
    },
};
module.exports = studentGradeController;