const Curriculum = require('../models/curriculum');
const AdmissionClassification = require("../models/admission-classification");

// Controller methods
const CurriculumController = {
    // Create a new curriculum
    createCurriculum: async (req, res) => {
        try {
            const curriculum = new Curriculum(req.body);
            const savedCurriculum = await curriculum.save();
            res.status(201).json(savedCurriculum);
        } catch (error) {
            res.status(400).json({ error: error.message });
            console.log(error);
        }
    },

    // Get all curriculums
    getAllCurriculums: async (req, res) => {
        try {
            const curriculums = await Curriculum.find();
            res.status(200).json(curriculums);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Update a curriculum by ID
    updateCurriculum: async (req, res) => {
        try {
            const { id } = req.params;
            //extract except grades from req.body-to prevent grades being updated
            const { updateData } = req.body;
            const updatedCurriculum = await Curriculum.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            );
            if (!updatedCurriculum) {
                return res.status(404).json({ message: 'Curriculum not found' });
            }
            res.status(200).json(updatedCurriculum);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Delete a curriculum by ID
    deleteCurriculum: async (req, res) => {
        try {
            const { id } = req.params;
            // Check if any classification is associated with the currcilum
            const classificationExists = await AdmissionClassification.findOne({ curriculum: id });
            if (classificationExists) {
                return res.status(400).json({
                    message: "Cannot delete, classification Exists. It is associated with one or more classification.",
                });
            }
            const deletedCurriculum = await Curriculum.findByIdAndDelete(id);
            if (!deletedCurriculum) {
                return res.status(404).json({ message: 'Curriculum not found' });
            }
            res.status(200).json({ message: 'Curriculum deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },    
};

module.exports = CurriculumController;
