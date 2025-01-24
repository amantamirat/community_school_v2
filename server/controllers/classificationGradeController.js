const ClassificationGrade = require('../models/classification-grade');
const StudentGrade = require("../models/student-grade");
const GradeSection = require('../models/grade-sections');
const AdmissionClassification = require("../models/admission-classification");
const CurriculumGrade = require('../models/curriculum-grade');

// Controller methods
const ClassificationGradeController = {    

    syncCurriculumGrades: async (req, res) => {
        try {
            const { admission_classification } = req.params;
            const admissionClassification = await AdmissionClassification.findById(admission_classification).populate('curriculum');
            if (!admissionClassification) {
                return res.status(404).json({ message: 'AdmissionClassification not found' });
            }
            // Fetch CurriculumGrades associated with the curriculum of the AdmissionClassification
            const curriculumGrades = await CurriculumGrade.find({ curriculum: admissionClassification.curriculum });
            // Fetch existing ClassificationGrade records for this AdmissionClassification        
            const existingClassificationGrades = await ClassificationGrade.find({ admission_classification }).select('curriculum_grade');
            const existingGradeIds = existingClassificationGrades.map(record => record.curriculum_grade.toString());
            // Filter out already linked CurriculumGrades
            const missingCurriculumGrades = curriculumGrades.filter(grade => !existingGradeIds.includes(grade._id.toString()));
            // Insert missing CurriculumGrades
            const classificationGradesToInsert = missingCurriculumGrades.map(grade => ({
                admission_classification,
                curriculum_grade: grade._id
            }));

            const insertedGrades = await ClassificationGrade.insertMany(classificationGradesToInsert);

            // Fetch and populate the inserted grades
            const savedClassificationGrades = await ClassificationGrade.find({
                _id: { $in: insertedGrades.map(grade => grade._id) }
            }).populate({
                path: 'curriculum_grade',
                populate: { path: 'grade' }
            });
            res.status(201).json(savedClassificationGrades);
        } catch (error) {
            res.status(400).json({ message: error.message });
            //console.log(error);
        }
    },

    getClassificationGradesByClassification: async (req, res) => {
        try {
            const { admission_classification } = req.params;
            const classificationGrades = await ClassificationGrade.find({ admission_classification: admission_classification }).populate({
                path: 'curriculum_grade',
                populate: { path: 'grade', },
            });
            res.status(200).json(classificationGrades);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Delete a classificationGrade by ID
    deleteClassificationGrade: async (req, res) => {
        try {
            const { id } = req.params;

            const isReferencedInGradeSection = await GradeSection.exists({ classification_grade: id });
            if (isReferencedInGradeSection) {
                return res.status(400).json({
                    message: 'Cannot delete ClassificationGrade, it is referenced in GradeSection.'
                });
            }
            const isReferencedInStudentGrade = await StudentGrade.exists({ classification_grade: id });
            if (isReferencedInStudentGrade) {
                return res.status(400).json({
                    message: 'Cannot delete ClassificationGrade, it is referenced in StudentGrade.'
                });
            }
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
