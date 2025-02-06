const GradeSection = require('../models/grade-sections');
const ClassificationGrade = require('../models/classification-grade');
const StudentGrade = require("../models/student-grade");
const { createSectionSubjectsByGradeSection } = require('../services/sectionSubjectService');
const SectionSubject = require('../models/section-subject');
const TermClass = require('../models/term-class');

const GradeSectionController = {

    getGradeSectionsByClassificationGrade: async (req, res) => {
        try {
            const { classification_grade } = req.params;
            const gradeSections = await GradeSection.find({ classification_grade: classification_grade }).lean();
            res.status(200).json(gradeSections);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    createSection: async (req, res) => {
        try {
            const { classification_grade, section_number, status } = req.body;
            const classificationGrade = await ClassificationGrade.findById(classification_grade);
            if (!classificationGrade) {
                return res.status(404).json({ message: 'Classification grade not found' });
            }
            const gradeSection = new GradeSection({ classification_grade, section_number, status });
            const savedGradeSection = await gradeSection.save();
            await createSectionSubjectsByGradeSection(savedGradeSection);
            //await registerSectionClasses(classificationGrade.curriculum_grade, savedGradeSection);
            res.status(201).json(savedGradeSection);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    deleteSection: async (req, res) => {
        try {
            const { id } = req.params;
            const isReferenced = await StudentGrade.exists({ grade_section: id });
            if (isReferenced) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete GradeSection because Students are in the Section.',
                });
            }
            /*
            const sectionClassesWithTeacher = await SectionClass.exists({ grade_section: id, teacher: { $ne: null } });
            if (sectionClassesWithTeacher) {
                return res.status(400).json({
                    message: 'Cannot delete Grade Section because one of its classes is assigned to a teacher.'
                });
            }
            */
            const deletedGradeSection = await GradeSection.findByIdAndDelete(id);
            if (!deletedGradeSection) {
                return res.status(404).json({ message: 'Grade Section not found' });
            }
            const sectionSubjectsIds = await SectionSubject.distinct('_id', { grade_section: id });
            await TermClass.deleteMany({ section_subject: { $in: sectionSubjectsIds } });
            await SectionSubject.deleteMany({ grade_section: id });
            res.status(200).json({ message: 'Section deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
};

module.exports = GradeSectionController;
