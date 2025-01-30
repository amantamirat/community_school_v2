const GradeSubject = require('../models/grade-subject');
const CurriculumGrade = require('../models/curriculum-grade');
const SubjectTerm = require('../models/subject-term');
const SubjectWeight = require('../models/subject-weight');

const SectionClass = require("../models/section-class");

const GradeSubjectController = {

    createGradeSubject: async (req, res) => {
        try {
            const { curriculum_grade, subject, optional } = req.body;

            const curriculumGrade = await CurriculumGrade.findById(curriculum_grade).populate('curriculum');
            if (!curriculumGrade) {
                return res.status(404).json({ message: 'Curriculum Grade not found' });
            }
            const number_of_terms = curriculumGrade.curriculum.number_of_terms;
            if (!number_of_terms) {
                return res.status(400).json({ message: 'Invalid curriculum' });
            }
            const newGradeSubject = new GradeSubject({
                curriculum_grade,
                subject,
                optional
            });
            await newGradeSubject.save();

            const subjectTerms = [];
            for (let term = 1; term <= number_of_terms; term++) {
                subjectTerms.push({ grade_subject: newGradeSubject._id, term });
            }
            await SubjectTerm.insertMany(subjectTerms);

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
            const { id } = req.params;
            const { optional } = req.body;
            const classExists = await SectionClass.findOne({ grade_subject: id });
            if (classExists) {
                return res.status(400).json({
                    message: "Cannot Update, Subject Aleady Registred. It is associated with one or more classes.",
                });
            }
            const updatedGradeSubject = await GradeSubject.findByIdAndUpdate(
                id,
                { optional },
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
            const { id } = req.params;
            const weightExists = await SubjectWeight.exists({ grade_subject: id });
            if (weightExists) {
                return res.status(400).json({
                    message: "Cannot delete. It is associated with one or more weights.",
                });
            }
            const classExists = await SectionClass.exists({ grade_subject: id });
            if (classExists) {
                return res.status(400).json({
                    message: "Cannot delete, Subject Registred. It is associated with one or more classes.",
                });
            }
            const deletedGradeSubject = await GradeSubject.findByIdAndDelete(id);
            if (!deletedGradeSubject) {
                return res.status(404).json({ message: 'Grade Subject not found' });
            }
            await SubjectTerm.deleteMany({ grade_subject: id });
            res.status(200).json(deletedGradeSubject);
        } catch (err) {
            res.status(500).json({ message: 'Error deleting GradeSubject', error: err });
        }
    }
}

module.exports = GradeSubjectController;






