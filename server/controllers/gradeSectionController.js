const GradeSection = require('../models/grade-sections');
const ClassificationGrade = require('../models/classification-grade');
const SectionClass = require("../models/section-class");
const GradeSubject = require('../models/grade-subject');
const StudentGrade = require("../models/student-grade");

// Controller methods
const GradeSectionController = {

    createGradeSection: async (req, res) => {
        try {
            const { classification_grade, section_number } = req.body;
            const class_grade = await ClassificationGrade.findById(classification_grade);
            if (!class_grade) {
                return res.status(404).json({ message: 'Classification grade not found' });
            }
            //console.log(req.body);
            const gradeSection = new GradeSection({ classification_grade, section_number });
            const savedGradeSection = await gradeSection.save();

            const subjectGrades = await GradeSubject.find({ curriculum_grade: class_grade.curriculum_grade, optional: false });
            //console.log(subjectGrades);
            const sectionClasses = subjectGrades.map(subjectGrade => ({
                grade_section: savedGradeSection._id,
                grade_subject: subjectGrade._id
            }));

            await SectionClass.insertMany(sectionClasses);

            res.status(201).json(savedGradeSection);
        } catch (error) {
            res.status(500).json({ message: error.message });
            //console.log(error);
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
            const isReferenced = await StudentGrade.exists({ grade_section: id });
            if (isReferenced) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete GradeSection because it is referenced in StudentGrade.',
                });
            }
            const sectionClasses = await SectionClass.find({ grade_section: id });
            if (sectionClasses.length) {
                for (const cls of sectionClasses) {
                    if (cls.teacher) {
                        return res.status(400).json({
                            message: 'Cannot delete GradeSection because one of its class is assigned for a teacher.'
                        });
                    }
                }
                const ack = await SectionClass.deleteMany({ grade_section: id });
                //console.log(ack, "class of sections cleared");
            }
            // If not referenced, proceed with deletion    
            const deletedGradeSection = await GradeSection.findByIdAndDelete(id);
            if (!deletedGradeSection) {
                return res.status(404).json({ message: 'Grade Section not found' });
            }
            res.status(200).json({ message: 'Section deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
};

module.exports = GradeSectionController;
