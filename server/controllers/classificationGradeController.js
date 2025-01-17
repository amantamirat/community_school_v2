const ClassificationGrade = require('../models/classification-grade');

// Controller methods
const ClassificationGradeController = {
    // Create a new classificationGrade
    createClassificationGrade: async (req, res) => {
        try {
            //console.log("create***")
            const classificationGrade = new ClassificationGrade(req.body);
            const savedClassificationGrade = await classificationGrade.save();
            res.status(201).json(savedClassificationGrade);
        } catch (error) {
            res.status(400).json({ message: error.message });
            console.log(error);
        }
    },


    getClassificationGradesByClassification: async (req, res) => {
        try {
            const classificationGrades = await ClassificationGrade.find({ admission_classification: req.params.admission_classification }).populate({
                path: 'curriculum_grade',
                populate: { path: 'grade', },
            });
            res.status(200).json(classificationGrades);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Update a classificationGrade by ID
    updateClassificationGrade: async (req, res) => {
        try {
            const { id } = req.params;
            const { updateData } = req.body;
            const updatedClassificationGrade = await ClassificationGrade.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            );
            if (!updatedClassificationGrade) {
                return res.status(404).json({ message: 'Classification Grade not found' });
            }
            res.status(200).json(updatedClassificationGrade);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Delete a classificationGrade by ID
    deleteClassificationGrade: async (req, res) => {
        try {
            const { id } = req.params;
            const deletedClassificationGrade = await ClassificationGrade.findByIdAndDelete(id);
            if (!deletedClassificationGrade) {
                return res.status(404).json({ message: 'Classification Grade not found' });
            }
            res.status(200).json({ message: 'Classification Grade deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
};

module.exports = ClassificationGradeController;
