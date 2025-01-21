const Curriculum = require('../models/curriculum');
const AdmissionClassification = require("../models/admission-classification");
const CurriculumGrade = require('../models/curriculum-grade');

// Controller methods
const CurriculumController = {
    // Create a new curriculum
    createCurriculum: async (req, res) => {
        try {
            const { title, classification, number_of_terms, maximum_point, minimum_pass_mark } = req.body;
            const curriculum = new Curriculum({ title, classification, number_of_terms, maximum_point, minimum_pass_mark });
            const savedCurriculum = await curriculum.save();
            res.status(201).json(savedCurriculum);
        } catch (error) {
            res.status(400).json({ message: error.message });
            //console.log(error);
        }
    },

    // Get all curriculums
    getCurriculums: async (req, res) => {
        try {
            const curriculums = await Curriculum.find();
            res.status(200).json(curriculums);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Update a curriculum by ID
    updateCurriculum: async (req, res) => {
        try {
            const { id } = req.params;
            const { title, classification, number_of_terms, maximum_point, minimum_pass_mark } = req.body;
            const updatedCurriculum = await Curriculum.findByIdAndUpdate(
                id,
                { title, classification, number_of_terms, maximum_point, minimum_pass_mark },
                { new: true, runValidators: true }
            );
            if (!updatedCurriculum) {
                return res.status(404).json({ message: 'Curriculum not found' });
            }
            res.status(200).json(updatedCurriculum);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Delete a curriculum by ID
    deleteCurriculum: async (req, res) => {
        try {
            const { id } = req.params;
            const gradeExist = await CurriculumGrade.findOne({ curriculum: id });
            if (gradeExist) {
                return res.status(400).json({
                    message: "Cannot delete, grade exist. It is associated with one or more admission curriculum grades.",
                });
            }
            const classificationExist = await AdmissionClassification.findOne({ curriculum: id });
            if (classificationExist) {
                return res.status(400).json({
                    message: "Cannot delete, classification Exists. It is associated with one or more admission classification.",
                });
            }
            const deletedCurriculum = await Curriculum.findByIdAndDelete(id);
            if (!deletedCurriculum) {
                return res.status(404).json({ message: 'Curriculum not found' });
            }
            res.status(200).json({ message: 'Curriculum deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
};

module.exports = CurriculumController;
