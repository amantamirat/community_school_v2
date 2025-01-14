const ExternalStudentPriorInfo = require('../models/external-student-info');

const externalStudentPriorInfoController = {
    createExternalStudentPriorInfo: async (req, res) => {
        try {
            const {
                student,
                school_name,
                academic_year,
                classification,
                grade,
                average_result,
                status,
                transferReason,
            } = req.body;

            const newInfo = new ExternalStudentPriorInfo({
                student,
                school_name,
                academic_year,
                classification,
                grade,
                average_result,
                status,
                transferReason,
            });

            await newInfo.save();
            res.status(201).json(newInfo);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getExternalInfoByStudent: async (req, res) => {
        try {
            const { student_id } = req.params;
            const priorInfo = await ExternalStudentPriorInfo.findOne({ student: student_id }).populate('grade');
            if (!priorInfo) {
                return res.status(404).json({ message: "Prior information not found" });
            }
            res.status(200).json(priorInfo);
        } catch (error) {
            res.status(500).json({ message: "Error fetching prior information", error });
        }

    },

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

    updateExternalStudentPriorInfo: async (req, res) => {
        try {
            const { id } = req.params;
            const {
                student,
                school_name,
                academic_year,
                classification,
                grade,
                average_result,
                status,
                transferReason,
            } = req.body;

            const updatedInfo = await ExternalStudentPriorInfo.findByIdAndUpdate(
                id,
                { student, school_name, academic_year, classification, grade, average_result, status, transferReason },
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
            const deletedInfo = await ExternalStudentPriorInfo.findByIdAndDelete(id);

            if (!deletedInfo) {
                return res.status(404).json({ message: "Prior information not found" });
            }

            res.status(200).json({ message: "Prior information deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Error deleting prior information", error });
        }
    },
};

module.exports = externalStudentPriorInfoController;
