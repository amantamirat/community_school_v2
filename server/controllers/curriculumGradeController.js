const CurriculumGrade = require('../models/curriculum-grade');
const ClassificationGrade = require('../models/classification-grade');
// Create a new CurriculumGrade
exports.createCurriculumGrade = async (req, res) => {
    try {
        const { curriculum, grade } = req.body;
        // Create a new curriculum-grade relationship
        const newCurriculumGrade = new CurriculumGrade({
            curriculum,
            grade
        });

        // Save to the database
        await newCurriculumGrade.save();
        res.status(201).json(newCurriculumGrade);
    } catch (err) {
        res.status(500).json({ message: 'Error creating CurriculumGrade', error: err });
    }
};

// Get all CurriculumGrades by curriculum
exports.getCurriculumGradesByCurriculum = async (req, res) => {
    try {
        const curriculumGrades = await CurriculumGrade.find({ curriculum: req.params.curriculum });
        res.status(200).json(curriculumGrades);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching CurriculumGrades', error: err });
    }
};


// Update a CurriculumGrade
exports.updateCurriculumGrade = async (req, res) => {
    try {
        const { curriculum, grade } = req.body;

        const updatedCurriculumGrade = await CurriculumGrade.findByIdAndUpdate(
            req.params.id,
            { curriculum, grade },
            { new: true }
        );

        if (!updatedCurriculumGrade) {
            return res.status(404).json({ message: 'CurriculumGrade not found' });
        }

        res.status(200).json(updatedCurriculumGrade);
    } catch (err) {
        res.status(500).json({ message: 'Error updating CurriculumGrade', error: err });
    }
};


exports.getCurriculumGradeById = async (req, res) => {
    try {
        const curriculumGrade = await CurriculumGrade.findById(req.params.id);
        if (!curriculumGrade) {
            return res.status(404).json({ message: 'CurriculumGrade not found' });
        }
        res.status(200).json(curriculumGrade);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching CurriculumGrade', error: err });
    }
};

// Delete a CurriculumGrade
exports.deleteCurriculumGrade = async (req, res) => {
    try {

        const gradeExists = await ClassificationGrade.findOne({ curriculum_grade: req.params.id});
        if (gradeExists) {
            return res.status(400).json({
                message: "Cannot delete, Grade Registred. It is associated with one or more classification, try by removing classification grade first.",
            });
        }
        const deletedCurriculumGrade = await CurriculumGrade.findByIdAndDelete(req.params.id);

        if (!deletedCurriculumGrade) {
            return res.status(404).json({ message: 'CurriculumGrade not found' });
        }
        res.status(200).json(deletedCurriculumGrade);
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Error deleting CurriculumGrade', error: err });
    }
};
