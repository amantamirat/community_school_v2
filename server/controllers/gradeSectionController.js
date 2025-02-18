const GradeSection = require('../models/grade-sections');
const StudentGrade = require("../models/student-grade");
const { createSectionSubjectsByGradeSection, removeSectionSubjects } = require('../services/sectionSubjectService');
const SectionSubject = require('../models/section-subject');
const ClassificationGrade = require('../models/classification-grade');


const GradeSectionController = {

    getGradeSectionsByClassificationGrade: async (req, res) => {
        try {
            const { classification_grade } = req.params;
            const gradeSections = await GradeSection.find({ classification_grade: classification_grade }).populate('home_teacher').lean();
            res.status(200).json(gradeSections);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    openSection: async (req, res) => {
        const { id } = req.params;
        const gradeSection = await GradeSection.findById(id).populate('classification_grade');
        if (!gradeSection) {
            return res.status(404).json({ message: 'Grade section not found' });
        }
        if (gradeSection.status === 'OPEN') {
            return res.status(400).json({ message: 'Section already Open' });
        }
        if (gradeSection.classification_grade.status === "CLOSED") return res.status(404).json({ message: 'Can not Open Section, Classification Grade is Closed.' });
        gradeSection.status = "OPEN";
        const savedGradeSection = await gradeSection.save();
        return res.status(200).json(savedGradeSection);
    },

    closeSection: async (req, res) => {
        const { id } = req.params;
        const gradeSection = await GradeSection.findById(id);
        if (!gradeSection) {
            return res.status(404).json({ message: 'Grade section not found' });
        }
        if (gradeSection.status === 'CLOSED') {
            return res.status(400).json({ message: 'Section already closed' });
        }
        const sectionSubjects = await SectionSubject.find({ grade_section: id }).lean();
        if (sectionSubjects.length === 0) { return res.status(400).json({ message: 'Empty section can not be closed.' }); }
        const hasActiveSubject = sectionSubjects.some(subject => subject.status === 'ACTIVE');
        if (hasActiveSubject) {
            return res.status(400).json({ message: 'Cannot close section, active class found' });
        }
        gradeSection.status = "CLOSED";
        const savedGradeSection = await gradeSection.save();
        return res.status(200).json(savedGradeSection);

    },

    createSection: async (req, res) => {
        try {
            const { classification_grade, section_number, number_of_seat, home_teacher } = req.body;
            const classificationGrade = await ClassificationGrade.findById(classification_grade);
            if (!classificationGrade) return res.status(404).json({ message: 'Classification grade not found' });
            if (classificationGrade.status === "CLOSED") return res.status(404).json({ message: 'Classification Grade is Closed.' });
            const gradeSection = new GradeSection({ classification_grade, section_number, number_of_seat, home_teacher });
            const savedGradeSection = await gradeSection.save();
            await createSectionSubjectsByGradeSection(savedGradeSection);
            res.status(201).json(savedGradeSection);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },


    updateSection: async (req, res) => {
        try {
            const { id } = req.params;
            const gradeSection = await GradeSection.findById(id).lean();
            if (!gradeSection) {
                return res.status(404).json({ message: 'Grade section not found' });
            }
            if (gradeSection.status === "CLOSED") {
                return res.status(404).json({ message: 'Grade section is closed, can not update' });
            }
            const { section_number, number_of_seat, home_teacher } = req.body;
            const updatedGradeSection = await GradeSection.findByIdAndUpdate(
                id,
                { section_number, number_of_seat, home_teacher },
                { new: true }
            );


            res.status(200).json(updatedGradeSection);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    deleteSection: async (req, res) => {
        try {
            const { id } = req.params;
            const gradeSection = await GradeSection.findById(id);
            if (!gradeSection) {
                return res.status(404).json({ message: 'Grade section not found' });
            }
            const isReferenced = await StudentGrade.exists({ grade_section: id });
            if (isReferenced) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete GradeSection because Students are in the Section.',
                });
            }
            await removeSectionSubjects(gradeSection);
            await GradeSection.findByIdAndDelete(id);
            res.status(200).json({ message: 'Section deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
};

module.exports = GradeSectionController;
