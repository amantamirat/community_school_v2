const GradeSection = require('../models/grade-sections');
const ClassificationGrade = require('../models/classification-grade');
const SectionClass = require("../models/section-class");
const GradeSubject = require('../models/grade-subject');

// Controller methods
const GradeSectionController = {

    createGradeSection: async (req, res) => {
        try {
            const { classification_grade, section } = req.body;
            const gradeSection = new GradeSection({ classification_grade, section });
            const savedGradeSection = await gradeSection.save();
            const cgrade = await ClassificationGrade.findById(classification_grade);
            const subjectGrades = await GradeSubject.find({ curriculum_grade: cgrade.curriculum_grade}); 
            for (const subjectGrade of subjectGrades) {
                const newSubjectClass = new SectionClass({
                    grade_section: savedGradeSection._id,
                    grade_subject: subjectGrade._id
                });
                await newSubjectClass.save();
            }   
            res.status(201).json(savedGradeSection);
        } catch (error) {
            res.status(400).json({ message: error.message });
            console.log(error);
        }
    },

    // Get all gradeSections
    getGradeSectionsByClassificationGrade: async (req, res) => {
        try {
            const gradeSections = await GradeSection.find({ classification_grade: req.params.classification_grade });
            res.status(200).json(gradeSections);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },



    // Delete a gradeSection by ID
    deleteGradeSection: async (req, res) => {
        try {
            const { id } = req.params;
            const deletedGradeSection = await GradeSection.findByIdAndDelete(id);
            if (!deletedGradeSection) {
                return res.status(404).json({ message: 'Section not found' });
            }
            res.status(200).json({ message: 'Section deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
};

module.exports = GradeSectionController;
