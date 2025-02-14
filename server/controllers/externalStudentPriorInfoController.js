const ExternalStudentPriorInfo = require('../models/external-student-info');
const ClassificationGrade = require('../models/classification-grade');
const Student = require("../models/student");
const StudentGrade = require("../models/student-grade");
const { getPreviousGrade } = require('../services/gradeService');


const externalStudentPriorInfoController = {

    getExternalInfoByStudent: async (req, res) => {
        try {
            const { student } = req.params;
            const priorInfo = await ExternalStudentPriorInfo.find({ student: student }).lean();
            if (!priorInfo) {
                return res.status(404).json({ message: "Prior informations not found" });
            }
            res.status(200).json(priorInfo);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error fetching prior information", error });
        }
    },

    getExternalElligibleStudentsByGrade: async (req, res) => {
        try {
            const { classification_grade } = req.params;
            const classificationGrade = await ClassificationGrade.findById(classification_grade).populate({
                path: 'admission_classification', populate: { path: 'academic_session', },
            }).populate({
                path: 'curriculum_grade', populate: { path: 'grade', },
            });
            if (!classificationGrade) {
                return res.status(404).json({ message: "Class Grade not found" });
            }
            if (classificationGrade.status === 'CLOSED') return res.status(404).json({ message: 'Can not find students, Grade is CLOSED' });
            const grade = classificationGrade.curriculum_grade.grade;
            const academic_year = classificationGrade.admission_classification.academic_session.academic_year;
            //const classification = classificationGrade.admission_classification.classification;
            const prevGrade = await getPreviousGrade(grade);
            let query;
            if (!prevGrade) {
                query = { grade: grade, status: "FAILED", registered: false, academic_year: { $lt: academic_year } };
            } else {
                query = {
                    $or: [
                        { grade: prevGrade, status: "PROMOTED", registered: false, academic_year: { $lt: academic_year } },
                        { grade: grade, status: "FAILED", registered: false, academic_year: { $lt: academic_year } }
                    ]
                };
            }
            const priorInfo = await ExternalStudentPriorInfo.find(query)
                .populate('student')
                .populate('grade');
            res.status(200).json(priorInfo);
        } catch (error) {
            console.log(error.message);
            res.status(500).json({ message: error.message });
        }
    },

    createExternalStudentPriorInfo: async (req, res) => {
        try {
            const { student_id } = req.params;
            const selectedStudent = await Student.findById(student_id);
            if (!selectedStudent) return res.status(404).json({ message: "Student not found" });
            if (selectedStudent.registered) return res.status(404).json({ message: "The student is registered. Can not attach External Info." });
            if (selectedStudent.has_perior_school_info) return res.status(404).json({ message: "The student has alredy One External Info." });

            const { student, school_name, academic_year, classification, grade, average_result, status, transfer_reason, } = req.body;
            const newInfo = new ExternalStudentPriorInfo({
                student, school_name, academic_year, classification, grade, average_result, status, transfer_reason,
            });
            selectedStudent.has_perior_school_info = true;
            await selectedStudent.save();
            await newInfo.save();
            res.status(201).json(newInfo);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: error.message });
        }
    },

    registerExternalStudents: async (req, res) => {
        try {
            const candidate_external_students = req.body;
            if (!Array.isArray(candidate_external_students)) {
                return res.status(400).json({ message: "Non-array students provided." });
            }
            const { classification_grade } = req.params;
            const classificationGrade = await ClassificationGrade.findById(classification_grade)
                .populate({
                    path: 'admission_classification',
                    populate: { path: 'academic_session' },
                })
                .populate({
                    path: 'curriculum_grade',
                    populate: { path: 'grade' },
                });

            if (!classificationGrade) {
                return res.status(404).json({ message: "Classification Grade not found." });
            }
            if (classificationGrade.status === 'CLOSED') {
                return res.status(400).json({ message: "Cannot register students, Grade is CLOSED." });
            }

            const currentGrade = classificationGrade.curriculum_grade.grade;
            const previousGrade = await getPreviousGrade(currentGrade);
            if (!previousGrade) {
                return res.status(404).json({ message: `Previous Grade not found for ${currentGrade.stage}-${currentGrade.level}` });
            }

            const academic_year = classificationGrade.admission_classification.academic_session.academic_year;

            // Fetch external student info in bulk
            const externalInfos = await ExternalStudentPriorInfo.find({ _id: { $in: candidate_external_students } });
            if (candidate_external_students.length !== externalInfos.length) {
                return res.status(404).json({ message: "No valid external student information found." });
            }

            // Filter students eligible for registration
            const student_grades = [];
            const external_students_info = [];

            externalInfos.forEach((externalInfo) => {
                const isEligible =
                    externalInfo.academic_year < academic_year &&
                    !externalInfo.registered &&
                    (
                        (externalInfo.status === 'PROMOTED' && externalInfo.grade.equals(previousGrade._id)) ||
                        (externalInfo.status === 'FAILED' && externalInfo.grade.equals(currentGrade._id))
                    );

                if (isEligible) {
                    student_grades.push({
                        classification_grade: classificationGrade._id,
                        student: externalInfo.student,
                        external_student_prior_info: externalInfo._id
                    });
                    external_students_info.push(externalInfo._id);
                }
            });

            if (!student_grades.length) {
                return res.status(400).json({ message: "No students eligible for registration." });
            }

            // Bulk insert student grades and update external students
            await Promise.all([
                StudentGrade.insertMany(student_grades),
                ExternalStudentPriorInfo.updateMany(
                    { _id: { $in: external_students_info } },
                    { $set: { registered: true } }
                )
            ]);

            res.status(201).json(external_students_info);
        } catch (error) {
            console.error("Error registering students:", error);
            res.status(500).json({ message: "Error registering students: " + error.message });
        }
    },


    updateExternalStudentPriorInfo: async (req, res) => {
        try {
            const { id } = req.params;
            const externalInfo = await ExternalStudentPriorInfo.findById(id);
            if (!externalInfo) return res.status(404).json({ message: "Information not found" });
            if (externalInfo.registered) return res.status(404).json({ message: "Information is registered. Can not update info." });
            const { school_name, academic_year, classification, grade,
                average_result, status, transfer_reason, } = req.body;
            const updatedInfo = await ExternalStudentPriorInfo.findByIdAndUpdate(id,
                {
                    school_name, academic_year, classification, grade,
                    average_result, status, transfer_reason
                }, { new: true });
            res.status(200).json(updatedInfo);
        } catch (error) {
            console.log(error.message);
            res.status(500).json({ message: error.message });
        }
    },

    deleteExternalStudentPriorInfo: async (req, res) => {
        try {
            const { id } = req.params;
            const externalInfo = await ExternalStudentPriorInfo.findById(id);
            if (!externalInfo) return res.status(404).json({ message: "Information not found" });
            if (externalInfo.registered) return res.status(404).json({ message: "The Info is registered. Can not delete info." });

            const selectedStudent = await Student.findById(externalInfo.student);
            if (!selectedStudent) return res.status(404).json({ message: "Student not found" });

            await ExternalStudentPriorInfo.findByIdAndDelete(id);
            selectedStudent.has_perior_school_info = false;
            await selectedStudent.save();
            res.status(200).json({ message: "Prior information deleted successfully" });
        } catch (error) {
            console.log(error.message);
            res.status(500).json({ message: "Error deleting prior information", error });
        }
    },
};

module.exports = externalStudentPriorInfoController;
