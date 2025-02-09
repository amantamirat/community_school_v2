const StudentGrade = require("../models/student-grade");
const ExternalStudentPriorInfo = require('../models/external-student-info');
const ClassificationGrade = require('../models/classification-grade');
const Student = require("../models/student");
const GradeSection = require('../models/grade-sections');
const { getPreviousGrade } = require('../services/gradeService');
const { registerStudentClasses, removeStudentClasses } = require('../services/studentClassService');




const studentGradeController = {

    getSectionedRegisteredStudents: async (req, res) => {
        try {
            const { grade_section } = req.params;
            const registered_students = await StudentGrade.find({ grade_section: grade_section }).populate('student').populate('grade_section');
            res.status(200).json(registered_students);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getUnSectionedRegisteredStudents: async (req, res) => {
        try {
            const { classification_grade } = req.params;
            const registered_students = await StudentGrade.find({
                classification_grade: classification_grade,
                grade_section: { $exists: false },
            })
                .populate('student');
            res.status(200).json(registered_students);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    registerExternalStudents: async (req, res) => {
        try {
            const candidate_external_students = req.body;
            if (!Array.isArray(candidate_external_students)) return res.status(404).json({ message: "Non array students provided." });

            const { classification_grade } = req.params;
            const classificationGrade = await ClassificationGrade.findById(classification_grade).populate({
                path: 'curriculum_grade',
                populate: { path: 'grade', },
            });

            if (!classificationGrade) return res.status(404).json({ message: "Classification Grade not found." });
            if (classificationGrade.status === 'CLOSED') return res.status(404).json({ message: 'Can not register students, Grade is CLOSED' });

            const currentGrade = classificationGrade.curriculum_grade.grade;
            const previousGrade = await getPreviousGrade(currentGrade);
            if (!previousGrade) return res.status(404).json({ message: 'Previous Grade not found, for ' + currentGrade.stage + '-' + currentGrade.level });

            // Fetch all external student information in parallel
            const externalInfos = await ExternalStudentPriorInfo.find({
                _id: { $in: candidate_external_students }
            });
            if (!externalInfos.length) return res.status(404).json({ message: "No valid external student information found." });

            const student_grades = [];
            const external_students_info = [];
            for (const externalInfo of externalInfos) {
                if (
                    (externalInfo.status === 'PASSED' && externalInfo.grade.equals(previousGrade._id)) ||
                    (externalInfo.status === 'FAILED' && externalInfo.grade.equals(currentGrade._id))
                ) {
                    student_grades.push({
                        classification_grade: classificationGrade._id,
                        student: externalInfo.student,
                        external_student_prior_info: externalInfo._id
                    });
                    external_students_info.push(externalInfo._id);
                }
            }
            if (!student_grades.length) return res.status(400).json({ message: "No students eligible for registration." });
            const savedStudentGrades = await StudentGrade.insertMany(student_grades);
            await ExternalStudentPriorInfo.updateMany(
                { _id: { $in: external_students_info } },
                { $set: { is_referred: true } }
            );
            res.status(201).json(savedStudentGrades);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error registering students" + error });
        }
    },

    registerFirstLevelStudents: async (req, res) => {
        try {
            const candidate_students = req.body;
            if (!Array.isArray(candidate_students)) return res.status(404).json({ message: "Non array students provided." });
            const { classification_grade } = req.params;
            const classificationGrade = await ClassificationGrade.findById(classification_grade).populate({
                path: 'curriculum_grade',
                populate: { path: 'grade', },
            });
            if (!classificationGrade) return res.status(404).json({ message: "Classification Grade not found" });
            if (classificationGrade.status === 'CLOSED') return res.status(404).json({ message: 'Can not register students, Grade is CLOSED' });

            const currentGrade = classificationGrade.curriculum_grade.grade;
            if (currentGrade.level !== 1) return res.status(404).json({ message: 'Non First Level Grade Provided.' });

            const students = await Student.find({ _id: { $in: candidate_students } });
            if (!students.length) return res.status(404).json({ message: "No valid student information found." });

            const student_grades = [];
            const reg_students = [];
            for (const student of students) {
                if (!student.has_perior_school_info && !student.registered) {
                    student_grades.push({
                        student: student._id,
                        classification_grade: classificationGrade._id
                    });
                    reg_students.push(student._id);
                }
            }
            if (!student_grades.length) return res.status(400).json({ message: "No students eligible for registration." });
            const savedStudentGrades = await StudentGrade.insertMany(student_grades);
            await Student.updateMany({ _id: { $in: reg_students } }, { $set: { registered: true } });
            res.status(201).json(savedStudentGrades);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error registering students" + error });
        }
    },

    deregisterStudents: async (req, res) => {
        try {
            const { classification_grade } = req.params;
            const selected_registered_students = req.body;
            if (!Array.isArray(selected_registered_students)) {
                return res.status(404).json({ message: "Array students required for deregistering students" });
            }
            const classificationGrade = await ClassificationGrade.findById(classification_grade);
            if (!classificationGrade) {
                return res.status(404).json({ message: "Grade not found" });
            }

            const registeredStudents = await StudentGrade.find({ _id: { $in: selected_registered_students } });
            if (registeredStudents.length !== selected_registered_students.length) {
                return res.status(404).json({ message: "Some provided student IDs are invalid or not found" });
            }

            const dereg_new_students = [];
            const external_students_info = [];
            for (const regStudent of registeredStudents) {
                if (!regStudent.classification_grade.equals(classificationGrade._id)) {
                    return res.status(400).json({ message: "Some students do not belong to the selected grade" });
                }
                if (regStudent.grade_section) {
                    return res.status(400).json({ message: `Sectioned student ${regStudent._id} cannot be deregistered!` });
                }
                if (regStudent.external_student_prior_info) {
                    external_students_info.push(regStudent.external_student_prior_info);
                } else if (!regStudent.previous_student_grade) {
                    dereg_new_students.push(regStudent.student);
                }
            }
            const result = await StudentGrade.deleteMany({ _id: { $in: selected_registered_students } });
            // Reset external student info
            if (external_students_info.length > 0) {
                await ExternalStudentPriorInfo.updateMany(
                    { _id: { $in: external_students_info } },
                    { $set: { is_referred: false } }
                );
            }
            // Reset new student info
            if (dereg_new_students.length > 0) {
                await Student.updateMany(
                    { _id: { $in: dereg_new_students } },
                    { $set: { registered: false } }
                );
            }
            res.status(200).json(result);
        } catch (error) {
            //console.log(error);
            res.status(500).json({ message: error.message });
        }
    },

    //allocation of section
    allocateSection: async (req, res) => {
        try {
            const selected_students = req.body;
            if (!Array.isArray(selected_students)) {
                return res.status(404).json({ message: "error array students required" });
            }
            const { grade_section } = req.params;
            const gradeSection = await GradeSection.findById(grade_section);
            if (!gradeSection) {
                return res.status(404).json({ message: "Grade Section not found" });
            }
            if (gradeSection.status === 'CLOSED') return res.status(404).json({ message: 'Can not attach students, Section is CLOSED' });

            const registeredStudents = await StudentGrade.find({ _id: { $in: selected_students } });
            if (registeredStudents.length !== selected_students.length) {
                return res.status(404).json({ message: "Some provided student IDs are invalid or not found" });
            }
            const section_students = [];
            for (const studentGrade of registeredStudents) {
                if (!studentGrade.classification_grade.equals(gradeSection.classification_grade)) {
                    return res.status(404).json({ message: `Student ${studentGrade._id} does not belong to the selected grade` });
                }
                if (studentGrade.grade_section) {
                    return res.status(400).json({ message: `Student ${studentGrade._id} is sectioned student!` });
                }
                section_students.push(studentGrade._id);
            }
            await registerStudentClasses(gradeSection, registeredStudents);
            const result = await StudentGrade.updateMany({ _id: { $in: section_students } }, { $set: { grade_section: gradeSection._id } });
            res.status(200).json(result);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: error.message });
        }
    },

    detachSection: async (req, res) => {
        try {
            const { grade_section } = req.params;
            const selected_students = req.body;
            if (!Array.isArray(selected_students) || selected_students.length === 0) {
                return res.status(400).json({ message: "Error: An array of student IDs is required." });
            }
            const gradeSection = await GradeSection.findById(grade_section);
            if (!gradeSection) {
                return res.status(404).json({ message: "Grade Section not found" });
            }
            if (gradeSection.status === 'CLOSED') return res.status(404).json({ message: 'Can not detach students, Section is CLOSED' });
            
            const studentGrades = await StudentGrade.find({ _id: { $in: selected_students } }).lean();
            if (studentGrades.length !== selected_students.length) return res.status(400).json({ message: "Some provided student IDs are invalid." });
            const invalidSectionStudent = studentGrades.some(student => !student.grade_section?.equals(grade_section));
            if (invalidSectionStudent) return res.status(400).json({ message: `Some students are not in the correct section.` });

            await removeStudentClasses(selected_students);
            const result = await StudentGrade.updateMany({ _id: { $in: selected_students } }, { $unset: { grade_section: 1 } });
            res.status(200).json(result);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: error.message });
        }
    },



};
module.exports = studentGradeController;