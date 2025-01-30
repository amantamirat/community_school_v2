const GradeSection = require('../models/grade-sections');
const ClassificationGrade = require('../models/classification-grade');
const SectionClass = require("../models/section-class");
const GradeSubject = require('../models/grade-subject');
const StudentGrade = require("../models/student-grade");
const TermClass = require("../models/term-class");
const StudentGrade = require("../models/student-grade");


const GradeSectionController = {

    // Get gradeSections
    getGradeSectionsByClassificationGrade: async (req, res) => {
        try {
            const gradeSections = await GradeSection.find({ classification_grade: req.params.classification_grade });
            res.status(200).json(gradeSections);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },


    syncSectionClasses: async (req, res) => {
        try {
            const { classification_grade } = req.params;
            const classificationGrade = await ClassificationGrade.findById(classification_grade).populate({
                path: 'curriculum_grade',
                populate: { path: 'curriculum', },
            });
            if (!classificationGrade) throw new Error("Classification grade not found.");
            const gradeSections = await GradeSection.find({ classification_grade: classification_grade });
            const gradeSectionIds = gradeSections.map((_sec) => _sec._id);
            const subjectGrades = await GradeSubject.find({ curriculum_grade: classificationGrade.curriculum_grade, optional: false });
            let newSectionClasses = [];
            for (const gradeSection of gradeSectionIds) {
                for (const gradeSubject of subjectGrades) {
                    const existingSectionClass = await SectionClass.findOne({
                        grade_section: gradeSection,
                        grade_subject: gradeSubject._id
                    });
                    if (!existingSectionClass) {
                        const sectionClass = new SectionClass({
                            grade_section: gradeSection,
                            grade_subject: gradeSubject._id
                        });
                        newSectionClasses.push(sectionClass);
                    }
                }
            }
           
            if (newSectionClasses.length > 0) {
                const savedNewSectionClasses = await SectionClass.insertMany(newSectionClasses);
                let newTermClasses = [];
                for (let term = 1; term <= class_grade.curriculum_grade.curriculum.number_of_terms; term++) {
                    for (const sectionClass of savedNewSectionClasses) {
                        newTermClasses.push({
                            section_class: sectionClass._id,
                            term: term
                        })
                    }
                }
                const termClasses = await TermClass.insertMany(newTermClasses);
                const sectionStudents = await StudentGrade.find({ grade_section: { $in: gradeSectionIds } });
                const newStudentClass = [];
                for (const gradeSection of gradeSectionIds) {
                    const filteredSectionStudents = sectionStudents.filter(
                        sectionStud => sectionStud.grade_section.toString() === gradeSection
                    );
                    const filteredSectionClasses = savedNewSectionClasses.filter(
                        sectionClass => sectionClass.grade_section.toString() === gradeSection
                    );
                    for (const studentGrade of filteredSectionStudents) {
                        for (const sectionclass of filteredSectionClasses) {
                            const filteredTermClasses = termClasses.filter(termClass => termClass.section_class.toString() === sectionclass);
                            for (const termClass of filteredTermClasses) {
                                newStudentClass.push({
                                    student_grade: studentGrade._id,
                                    term_class: termClass._id,
                                });
                            }
                        }
                    }
                }
            }
            res.status(200).json(savedNewSectionClasses);
        } catch (error) {
            res.status(500).json({ message: error + "Error fetching Classs", error });
        }
    },
    createGradeSection: async (req, res) => {
        try {
            const { classification_grade, section_number } = req.body;
            const class_grade = await ClassificationGrade.findById(classification_grade).populate({
                path: 'curriculum_grade',
                populate: { path: 'curriculum', },
            });
            if (!class_grade) {
                return res.status(404).json({ message: 'Classification grade not found' });
            }
            const gradeSection = new GradeSection({ classification_grade, section_number });
            const savedGradeSection = await gradeSection.save();
            const subjectGrades = await GradeSubject.find({ curriculum_grade: class_grade.curriculum_grade, optional: false });
            const sectionClasses = subjectGrades.map(subjectGrade => ({
                grade_section: savedGradeSection._id,
                grade_subject: subjectGrade._id
            }));

            const savedSectionClasses = await SectionClass.insertMany(sectionClasses);
            const termClasses = [];
            for (let term = 1; term <= class_grade.curriculum_grade.curriculum.number_of_terms; term++) {
                for (const sectionClass of savedSectionClasses) {
                    termClasses.push({
                        section_class: sectionClass._id,
                        term: term
                    })
                }
            }
            await TermClass.insertMany(termClasses);
            res.status(201).json(savedGradeSection);
        } catch (error) {
            res.status(500).json({ message: error.message });
            //console.log(error);
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
                const sectionClassIds = sectionClasses.map(sc => sc._id);
                await TermClass.deleteMany({ section_class: { $in: sectionClassIds } });
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
