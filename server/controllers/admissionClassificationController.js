const AdmissionClassification = require("../models/admission-classification");
const CurriculumGrade = require('../models/curriculum-grade');
const ClassificationGrade = require('../models/classification-grade');



// Controller functions
const AdmissionClassificationController = {
    // Create a new admissionClassification
    createAdmissionClassification: async (req, res) => {
        try {
            const { academic_session, classification, curriculum } = req.body;
            const newAdmissionClassification = new AdmissionClassification({ academic_session, classification, curriculum });
            await newAdmissionClassification.save();
            const curriculumGrades = await CurriculumGrade.find({ curriculum: curriculum });
            for (const curriculumGrade of curriculumGrades) {
                const newClassificationGrade = new ClassificationGrade({
                    admission_classification: newAdmissionClassification._id,
                    curriculum_grade: curriculumGrade._id
                });
                await newClassificationGrade.save();
            }
            res.status(201).json(newAdmissionClassification);
        } catch (error) {
            res.status(500).json({ message: "Error creating admission Classification", error });
        }
    },

    // Get all admissionClassifications
    getAllAdmissionClassifications: async (req, res) => {
        try {
            const admissionClassifications = await AdmissionClassification.find();
            res.status(200).json(admissionClassifications);
        } catch (error) {
            res.status(500).json({ message: "Error fetching admissionClassifications", error });
        }
    },

    getAcademicSessionClassifications: async (req, res) => {
        try {
            const { id } = req.params;
            const admissionClassifications = await AdmissionClassification.find({ academic_session: id });
            res.status(200).json(admissionClassifications);
        } catch (error) {
            res.status(500).json({ message: error + "Error fetching admissionClassifications", error });
        }
    },

    // Update a admissionClassification
    updateAdmissionClassification: async (req, res) => {
        try {
            const { id } = req.params;
            const { academic_session, classification, curriculum } = req.body;
            const updatedAdmissionClassification = await AdmissionClassification.findByIdAndUpdate(id, { academic_session, classification, number_of_terms, curriculum }, { new: true });
            if (!updatedAdmissionClassification) {
                return res.status(404).json({ message: "Classification not found" });
            }

            res.status(200).json(updatedAdmissionClassification);
        } catch (error) {
            res.status(500).json({ message: "Error updating admissionClassification", error });
        }
    },

    // Delete a admissionClassification
    deleteAdmissionClassification: async (req, res) => {
        try {
            const { id } = req.params;
            const exists = false;
            if (exists) {
                return res.status(400).json({
                    message: "Cannot delete the admission Classification. It is associated.",
                });
            }
            const admissionClassification = await AdmissionClassification.findByIdAndDelete(id);
            if (!admissionClassification) {
                return res.status(404).json({ message: "Academic Session not found" });
            }
            res.status(200).json({ message: "Academic Session deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Error deleting admissionClassification", error });
        }
    }
};

module.exports = AdmissionClassificationController;
