const StudentGrade = require("../models/student-grade");
const ExternalStudentPriorInfo = require('../models/external-student-info');
const ClassificationGrade = require('../models/classification-grade');
const Student = require("../models/student");
const gradeController = require('../controllers/gradeController');
const studentGradeController = {
    registerExternalStudents: async (req, res) => {
        try {
            const { classification_grade } = req.params;
            const classificationGrade = await ClassificationGrade.findById(classification_grade).populate({
                path: 'curriculum_grade',
                populate: { path: 'grade', },
            });
            if (!classificationGrade) {
                return res.status(404).json({ message: "Classification Grade not found" });
            }
            const current_grade = classificationGrade.curriculum_grade.grade;
            const prev_grade = await gradeController.getPreviousGrade(current_grade.stage, current_grade.level, current_grade.specialization);
            if (!prev_grade) {
                return res.status(404).json({ message: 'Previous Grade not found, for ' + current_grade.stage + '-' + current_grade.level });
            }
            const candidate_external_students = req.body;
            const student_grades = [];
            const external_students_info = [];
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
                    external_students_info.push(externalInfo._id);
                }
            } else {
                res.status(404).json({ message: "Data protocol error, no array students found. Error for registering students" });
            }
            const saved_student_grades = await StudentGrade.insertMany(student_grades);
            await ExternalStudentPriorInfo.updateMany(
                { _id: { $in: external_students_info } },
                { $set: { is_referred: true } }
            );
            res.status(201).json(saved_student_grades);
        } catch (error) {
            //console.log(error);
            res.status(500).json({ message: "Error registering students" + error });
        }
    },

    registerFirstLevelStudents: async (req, res) => {
        try {
            const { classification_grade } = req.params;
            const classificationGrade = await ClassificationGrade.findById(classification_grade).populate({
                path: 'curriculum_grade',
                populate: { path: 'grade', },
            });
            if (!classificationGrade) {
                return res.status(404).json({ message: "Classification Grade not found" });
            }
            const current_grade = classificationGrade.curriculum_grade.grade;
            if (current_grade.level !== 1) {
                return res.status(404).json({ message: 'Non First Level Grade Provided.' });
            }
            const candidate_students = req.body;
            if (!Array.isArray(candidate_students)) {
                res.status(404).json({ message: "Non array students provided." });
            }
            const student_grades = [];
            const reg_students = [];
            for (const cadidate of candidate_students) {
                const student = await Student.findById(cadidate);
                if (!student) {
                    return res.status(404).json({ message: "Non Student Information Found." });
                }
                if (student.has_perior_school_info) {
                    continue;
                }
                const student_grade = new StudentGrade({
                    student: student._id,
                    classification_grade: classificationGrade._id
                });
                student_grades.push(student_grade);
                reg_students.push(cadidate);
            }

            const saved_student_grades = await StudentGrade.insertMany(student_grades);
            await Student.updateMany(
                { _id: { $in: reg_students } },
                { $set: { has_perior_school_info: true } }
            );
            res.status(201).json(saved_student_grades);
        } catch (error) {
            //console.log(error);
            res.status(500).json({ message: "Error registering students" + error });
        }
    },

    getRegisteredStudentsByClassificationGrade: async (req, res) => {
        try {
            const { classification_grade } = req.params;
            const classificationGrade = await ClassificationGrade.findById(classification_grade);
            if (!classificationGrade) {
                return res.status(404).json({ message: "Classification Grade not found" });
            }
            const registered_students = await StudentGrade.find({ classification_grade: classification_grade }).populate('student');
            res.status(200).json(registered_students);
        } catch (error) {
            //console.log(error);
            res.status(500).json({ message: error.message });
        }
    },

    deregisterStudents: async (req, res) => {
        try {
            const { classification_grade } = req.params;
            const classificationGrade = await ClassificationGrade.findById(classification_grade);
            if (!classificationGrade) {
                return res.status(404).json({ message: "Grade not found" });
            }
            const selected_registered_students = req.body;
            if (!Array.isArray(selected_registered_students)) {
                res.status(404).json({ message: "data protocol error array students required for deregistering students" });
            }
            const dereg_new_students = [];
            const external_students_info = [];
            for (const registred_student of selected_registered_students) {
                const reg_student = await StudentGrade.findById(registred_student);
                if (!reg_student) {
                    return res.status(404).json({ message: "Non Registred Student Information Found (Invalid ID Data)." });
                }
                if (!reg_student.classification_grade.equals(classificationGrade._id)) {
                    res.status(404).json({ message: "some students are not belongs to the selected grade" });
                }
                if (reg_student.external_student_prior_info) {
                    external_students_info.push(reg_student.external_student_prior_info);
                } else if (!reg_student.previous_student_grade) {
                    dereg_new_students.push(reg_student.student);
                }
            }
            const result = await StudentGrade.deleteMany({ _id: { $in: selected_registered_students } });
            await ExternalStudentPriorInfo.updateMany(
                { _id: { $in: external_students_info } },
                { $set: { is_referred: false } }
            );
            await Student.updateMany(
                { _id: { $in: dereg_new_students } },
                { $set: { has_perior_school_info: false } }
            );
            res.status(200).json(result);
        } catch (error) {
            //console.log(error);
            res.status(500).json({ message: error.message });
        }
    }
};
module.exports = studentGradeController;