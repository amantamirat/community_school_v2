const ExternalStudentPriorInfo = require('../models/external-student-info');
const ClassificationGrade = require('../models/classification-grade');
const Student = require("../models/student");
const StudentGrade = require("../models/student-grade");
const gradeController = require('../controllers/gradeController');


const externalStudentPriorInfoController = {

    getExternalInfoByStudent: async (req, res) => {
        try {
            const { student_id } = req.params;
            //const priorInfo = await ExternalStudentPriorInfo.findOne({ student: student_id }).populate('grade');
            const priorInfo = await ExternalStudentPriorInfo.find({ student: student_id }).populate('grade');
            if (!priorInfo) {
                return res.status(404).json({ message: "Prior informations not found" });
            }
            res.status(200).json(priorInfo);
        } catch (error) {
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
            const academic_year = classificationGrade.admission_classification.academic_session.academic_year;
            const classification = classificationGrade.admission_classification.classification;
            const prevGrade = await gradeController.getPreviousGrade(grade.stage, grade.level, grade.specialization);
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
            //console.log(error.message);
            res.status(500).json({ message: "Error fetching class grade information", error });
        }
    },

    createExternalStudentPriorInfo: async (req, res) => {
        try {
            const { student_id } = req.params;
            const _student = await Student.findById(student_id);
            if (!_student) {
                return res.status(404).json({ message: "Student not found" });
            }
            if (_student.registered) {
                return res.status(404).json({ message: "The student is currently registered. Can not attach External Info." });
            }
            const enrollments = await StudentGrade.find({ student: student_id });
            for(const enrollment of enrollments){
                if(enrollment.status==="PENDING"){
                    return res.status(404).json({ message: "The student is currently registered. Can not attach External Info at the moment." });              
                }
            }
            const {
                student,
                school_name,
                academic_year,
                classification,
                grade,
                average_result,
                status,
                transfer_reason,
            } = req.body;

            const newInfo = new ExternalStudentPriorInfo({
                student,
                school_name,
                academic_year,
                classification,
                grade,
                average_result,
                status,
                transfer_reason,
            });
            await newInfo.save();
            res.status(201).json(newInfo);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },


    updateExternalStudentPriorInfo: async (req, res) => {
        try {
            const { id } = req.params;
            const infoExists = await StudentGrade.exists({ external_student_prior_info: id });
            if (infoExists) {
                return res.status(400).json({
                    message: "Cannot update the info. It is associated with one or more class.",
                });
            }                
            const {
                school_name,
                academic_year,
                classification,
                grade,
                average_result,
                status,
                transfer_reason,
            } = req.body;

            const updatedInfo = await ExternalStudentPriorInfo.findByIdAndUpdate(
                id,
                { student, school_name, academic_year, classification, grade, average_result, status, transfer_reason },
                { new: true }
            );

            if (!updatedInfo) {
                return res.status(404).json({ message: "Prior information not found" });
            }
            res.status(200).json(updatedInfo);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    deleteExternalStudentPriorInfo: async (req, res) => {
        try {
            const { id } = req.params;
            const infoExists = await StudentGrade.exists({ external_student_prior_info: id });
            if (infoExists) {
                return res.status(400).json({
                    message: "Cannot delete the info. It is associated with one or more class.",
                });
            }  
            const deletedInfo = await ExternalStudentPriorInfo.findByIdAndDelete(id);
            if (!deletedInfo) {
                return res.status(404).json({ message: "Prior information not found" });
            }

            res.status(200).json({ message: "Prior information deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Error deleting prior information", error });
        }
    },

    /*    
    

    getAllExternalStudentPriorInfo: async (req, res) => {
        try {
            const priorInfo = await ExternalStudentPriorInfo.find().populate('student').populate('grade');
            res.status(200).json(priorInfo);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getExternalStudentPriorInfoById: async (req, res) => {
        try {
            const { id } = req.params;
            const priorInfo = await ExternalStudentPriorInfo.findById(id).populate('student').populate('grade');

            if (!priorInfo) {
                return res.status(404).json({ message: "Prior information not found" });
            }

            res.status(200).json(priorInfo);
        } catch (error) {
            res.status(500).json({ message: "Error fetching prior information", error });
        }
    },

    
    */


};

module.exports = externalStudentPriorInfoController;
