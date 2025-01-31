const GradeSection = require('../models/grade-sections');
const ClassificationGrade = require('../models/classification-grade');
const SectionClass = require("../models/section-class");
const GradeSubject = require('../models/grade-subject');
const StudentGrade = require("../models/student-grade");
const TermClass = require("../models/term-class");
const StudentClass = require('../models/student-class');


const GradeSectionController = {

    // Get gradeSections
    getGradeSectionsByClassificationGrade: async (req, res) => {
        try {
            const { classification_grade } = req.params;
            const gradeSections = await GradeSection.find({ classification_grade: classification_grade });
            res.status(200).json(gradeSections);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    createSection: async (req, res) => {
        try {
            const { classification_grade, section_number } = req.body;
            const classificationGrade = await ClassificationGrade.findById(classification_grade);
            if (!classificationGrade) {
                return res.status(404).json({ message: 'Classification grade not found' });
            }
            const gradeSection = new GradeSection({ classification_grade, section_number });
            const savedGradeSection = await gradeSection.save();
            const subjectGrades = await GradeSubject.find({ curriculum_grade: classificationGrade.curriculum_grade, optional: false });
            const sectionClasses = subjectGrades.map(subjectGrade => ({
                grade_section: savedGradeSection._id,
                grade_subject: subjectGrade._id
            }));
            await SectionClass.insertMany(sectionClasses);
            res.status(201).json(savedGradeSection);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    syncClasses: async (req, res) => {
        try {
            const { classification_grade } = req.params;
            const classificationGrade = await ClassificationGrade.findById(classification_grade);
            if (!classificationGrade) throw new Error("Classification grade not found.");

            const gradeGections = await GradeSection.find({ classification_grade: classification_grade }).lean();
            const gradeSectionIds = gradeGections.map(sec => sec._id);

            const existingSectionClasses = await SectionClass.find({ grade_section: { $in: gradeSectionIds } }).select('grade_subject');
            const existingGradeSubjectIds = existingSectionClasses.map(secclass => secclass.grade_subject.toString());

            const gradeSubjects = await GradeSubject.find({ curriculum_grade: classificationGrade.curriculum_grade, optional: false }).lean();
            const missingGradeSubjects = gradeSubjects.filter(subject => !existingGradeSubjectIds.includes(subject._id.toString()));

            let newSectionClasses = []
            for (const section of gradeSectionIds) {
                for (const subject of missingGradeSubjects) {
                    newSectionClasses.push({
                        grade_section: section,
                        grade_subject: subject
                    })
                }
            }
            const insertedClasses = await SectionClass.insertMany(newSectionClasses);
            res.status(201).json(insertedClasses);
        } catch (error) {
            res.status(400).json({ message: error.message });
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
            const sectionClassesWithTeacher = await SectionClass.exists({ grade_section: id, teacher: { $ne: null } });
            if (sectionClassesWithTeacher) {
                return res.status(400).json({
                    message: 'Cannot delete Grade Section because one of its classes is assigned to a teacher.'
                });
            }
            await SectionClass.deleteMany({ grade_section: id });
            const deletedGradeSection = await GradeSection.findByIdAndDelete(id);
            if (!deletedGradeSection) {
                return res.status(404).json({ message: 'Grade Section not found' });
            }
            res.status(200).json({ message: 'Section deleted successfully' });
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

            const [gradeSections, subjectGrades] = await Promise.all([
                GradeSection.find({ classification_grade }).lean(),
                GradeSubject.find({ curriculum_grade: classificationGrade.curriculum_grade, optional: false }).lean()
            ]);
            const gradeSectionIds = gradeSections.map(sec => sec._id);
            // Find existing section classes
            const existingSectionClasses = await SectionClass.find({ grade_section: { $in: gradeSectionIds } }).lean();
            const existingPairs = new Set(existingSectionClasses.map(sc => `${sc.grade_section}-${sc.grade_subject}`));

            let newSectionClasses = [];
            for (const gradeSection of gradeSectionIds) {
                for (const gradeSubject of subjectGrades) {
                    const key = `${gradeSection}-${gradeSubject._id}`;
                    if (!existingPairs.has(key)) {
                        newSectionClasses.push({
                            grade_section: gradeSection,
                            grade_subject: gradeSubject._id
                        });
                    }
                }
            }
            if (newSectionClasses.length > 0) {
                const savedNewSectionClasses = await SectionClass.insertMany(newSectionClasses);
                //newSectionClasses = savedNewSectionClasses;
                let newTermClasses = [];
                for (let term = 1; term <= classificationGrade.curriculum_grade.curriculum.number_of_terms; term++) {
                    for (const sectionClass of savedNewSectionClasses) {
                        newTermClasses.push({
                            section_class: sectionClass._id,
                            term: term
                        })
                    }
                }
                const termClasses = await TermClass.insertMany(newTermClasses);
                //studentclass creation
                const sectionStudents = await StudentGrade.find({ grade_section: { $in: gradeSectionIds } });
                const newStudentClasses = [];
                const termClassMap = new Map();
                // Group term classes by section_class
                for (const tc of termClasses) {
                    const key = tc.section_class.toString();
                    if (!termClassMap.has(key)) {
                        termClassMap.set(key, []);
                    }
                    termClassMap.get(key).push(tc._id);
                }

                for (const student of sectionStudents) {
                    for (const sectionClass of savedNewSectionClasses) {
                        const termClassIds = termClassMap.get(sectionClass._id.toString());
                        if (termClassIds) {
                            for (const termClassId of termClassIds) {
                                newStudentClasses.push({
                                    student_grade: student._id,
                                    term_class: termClassId,
                                });
                            }
                        }
                    }
                }
                await StudentClass.insertMany(newStudentClasses);
            }
            res.status(200).json(newSectionClasses);
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
