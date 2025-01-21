const GradeSubject = require('../models/grade-subject');
const SectionClass = require("../models/section-class");

const GradeSubjectController = {
    createGradeSubject: async (req, res) => {
        try {
            const { curriculum_grade, subject, optional } = req.body;
            const newGradeSubject = new GradeSubject({
                curriculum_grade,
                subject,
                optional
            });
            await newGradeSubject.save();
            res.status(201).json(newGradeSubject);
        } catch (err) {
            res.status(500).json({ message: 'Error creating GradeSubject', error: err });
        }
    },
    getGradeSubjectsByCurriculumGrade: async (req, res) => {
        try {
            const gradeSubjects = await GradeSubject.find({ curriculum_grade: req.params.curriculum_grade }).populate("subject");
            res.status(200).json(gradeSubjects);
        } catch (err) {
            res.status(500).json({ message: 'Error fetching GradeSubjects', error: err });
        }
    },
    updateGradeSubject: async (req, res) => {
        try {
            const { curriculum_grade, subject, optional } = req.body;
            const updatedGradeSubject = await GradeSubject.findByIdAndUpdate(
                req.params.id,
                { curriculum_grade, subject, optional },
                { new: true }
            );
            if (!updatedGradeSubject) {
                return res.status(404).json({ message: 'GradeSubject not found' });
            }
            res.status(200).json(updatedGradeSubject);
        } catch (err) {
            res.status(500).json({ message: 'Error updating GradeSubject', error: err });
        }
    },
    deleteGradeSubject: async (req, res) => {
        try {
            const deletedGradeSubject = await GradeSubject.findByIdAndDelete(req.params.id);
            const classExists = await SectionClass.findOne({ grade_subject: req.params.id });
            if (classExists) {
                return res.status(400).json({
                    message: "Cannot delete, Subject Registred. It is associated with one or more classes.Try Deleting Class First",
                });
            }
            if (!deletedGradeSubject) {
                return res.status(404).json({ message: 'Grade Subject not found' });
            }
            res.status(200).json(deletedGradeSubject);
        } catch (err) {
            res.status(500).json({ message: 'Error deleting GradeSubject', error: err });
        }
    }
}

module.exports = GradeSubjectController;






