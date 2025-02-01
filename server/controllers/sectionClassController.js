const SectionClass = require("../models/section-class");
const GradeSection = require('../models/grade-sections');
const GradeSubject = require('../models/grade-subject');

const SectionClassController = {

    getAllSectionClasssBySection: async (req, res) => {
        try {
            const { grade_section } = req.params;
            const SectionClasss = await SectionClass.find({ grade_section: grade_section }).populate('teacher').populate({
                path: 'subject_term',
                populate: { path: 'grade_subject', populate: { path: 'subject', } },
            });
            res.status(200).json(SectionClasss);
        } catch (error) {
            res.status(500).json({ message: error + "Error fetching Classs", error });
        }
    },    

    createSectionClass: async (req, res) => {
        try {
            const { grade_section, grade_subject } = req.body;
            //make sure grade_section and grade_subject are in the same curriculum_grade
            const section = await GradeSection.findById(grade_section).populate({
                path: 'classification_grade',
                populate: { path: 'curriculum_grade', populate: { path: 'curriculum', } },
            });
            if (!section) {
                return res.status(404).json({ message: 'Grade section not found' });
            }
            const { classification_grade } = section;
            if (!classification_grade) {
                return res.status(404).json({ message: 'Classification grade not found in the grade section' });
            }
            const subject = await GradeSubject.findById(grade_subject);
            if (!subject) {
                return res.status(404).json({ message: 'Grade subject not found' });
            }
            // Validate that the curriculum grades match
            if (!classification_grade.curriculum_grade._id.equals(subject.curriculum_grade)) {
                return res.status(400).json({
                    message: 'The GradeSection and GradeSubject must belong to the same curriculum grade'
                });
            }
            const newSectionClass = new SectionClass({ grade_section, grade_subject });
            const termClasses = [];
            for (let term = 1; term <= classification_grade.curriculum_grade.curriculum.number_of_terms; term++) {
                termClasses.push({
                    section_class: newSectionClass._id,
                    term: term
                })
            }            
            await newSectionClass.save();
            res.status(201).json(newSectionClass);
        } catch (error) {
            res.status(500).json({ message: "Error creating Class", error });
        }
    },

    // Update a SectionClass
    updateSectionClass: async (req, res) => {
        try {
            const { id } = req.params;
            const { grade_section, grade_subject, teacher } = req.body;
            const updatedSectionClass = await SectionClass.findByIdAndUpdate(id, { grade_section, grade_subject, teacher }, { new: true });
            if (!updatedSectionClass) {
                return res.status(404).json({ message: "Class not found" });
            }
            res.status(200).json(updatedSectionClass);
        } catch (error) {
            res.status(500).json({ message: "Error updating Class", error });
        }
    },

    // Delete a SectionClass
    deleteSectionClass: async (req, res) => {
        try {
            const { id } = req.params;
            const sectionClass = await SectionClass.findById(id).populate('grade_subject');
            if (!sectionClass) {
                return res.status(404).json({ message: "Class not found" });
            }
            if (!sectionClass.grade_subject.optional) {
                return res.status(400).json({
                    message: "Cannot delete the Class. It is mandatory.",
                });
            }
            const deletedClass = await SectionClass.deleteOne({ _id: id });
            if (!deletedClass) {
                return res.status(404).json({ message: "Class not found" });
            }
            res.status(200).json({ message: "class deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Error deleting class" + error });
        }
    }
};

module.exports = SectionClassController;
