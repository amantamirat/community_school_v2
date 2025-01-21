const CurriculumGrade = require('../models/curriculum-grade');
const ClassificationGrade = require('../models/classification-grade');
const GradeSubject = require('../models/grade-subject');

const CurriculumGradeController = {
    createCurriculumGrade: async (req, res) => {
        try {
            const { curriculum, grade } = req.body;
            const newCurriculumGrade = new CurriculumGrade({
                curriculum,
                grade
            });
            await newCurriculumGrade.save();
            res.status(201).json(newCurriculumGrade);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },
    getCurriculumGradesByCurriculum: async (req, res) => {
        try {
            const curriculumGrades = await CurriculumGrade.find({ curriculum: req.params.curriculum });
            res.status(200).json(curriculumGrades);
        } catch (err) {
            res.status(500).json({ message: 'Error fetching CurriculumGrades', error: err });
        }
    },
    deleteCurriculumGrade: async (req, res) => {
        try {
            const subjectExists = await GradeSubject.findOne({ curriculum_grade: req.params.id });
            if (subjectExists) {
                return res.status(400).json({
                    message: "Cannot delete, Subject Exist. It is associated with one or more Subjects.",
                });
            }
            const gradeExists = await ClassificationGrade.findOne({ curriculum_grade: req.params.id });
            if (gradeExists) {
                return res.status(400).json({
                    message: "Cannot delete, Grade Registred. It is associated with one or more classification, try by removing classification grade first.",
                });
            }
            const deletedCurriculumGrade = await CurriculumGrade.findByIdAndDelete(req.params.id);
            if (!deletedCurriculumGrade) {
                return res.status(404).json({ message: 'Curriculum Grade not found' });
            }
            res.status(200).json(deletedCurriculumGrade);
        } catch (err) {
            //console.log(err)
            res.status(500).json({ message: 'Error deleting CurriculumGrade', error: err });
        }
    }
}
module.exports = CurriculumGradeController;







