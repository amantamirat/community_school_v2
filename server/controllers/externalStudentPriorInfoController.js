const ExternalStudentPriorInfo = require('../models/external-student-info');
const ClassificationGrade = require('../models/classification-grade');
const Student = require("../models/student");
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
                path: 'admission_classification',
                populate: {
                    path: 'academic_session',
                },
            }).populate({
                path: 'curriculum_grade',
                populate: {
                    path: 'grade',
                },
            });

            if (!classificationGrade) {
                return res.status(404).json({ message: "Class Grade not found" });
            }
            const grade = classificationGrade.curriculum_grade.grade;
            //const academic_year = classificationGrade.admission_classification.academic_session.academic_year;
            //const classification = classificationGrade.admission_classification.classification;
            const prevGrade = await getPreviousGrade(grade);
            let query;
            if (!prevGrade) {
                query = { grade: grade, status: "FAILED", is_referred: false };
            } else {
                query = {
                    $or: [
                        { grade: prevGrade, status: "PASSED", is_referred: false },
                        { grade: grade, status: "FAILED", is_referred: false }
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
