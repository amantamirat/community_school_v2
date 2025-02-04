const GradeSection = require('../models/grade-sections');
const ClassificationGrade = require('../models/classification-grade');
const GradeSubject = require('../models/grade-subject');
const StudentGrade = require("../models/student-grade");
const SubjectTerm = require('../models/subject-term');
const SectionClass = require('../models/section-class');


const registerSectionClasses = async (curriculum_grade, savedSection) => {
    const subjectTerms = await fetchSubjectTerms(curriculum_grade);
    const newSectionTermClasses = subjectTerms.map(termClass => ({
        grade_section: savedSection._id,
        subject_term: termClass._id,
        status: termClass.term === 1 ? 'ACTIVE' : 'PENDING'
    }));
    return await SectionClass.insertMany(newSectionTermClasses);
};

const fetchSubjectTerms = async (curriculum_grade) => {
    const gradeSubjects = await GradeSubject.find({ curriculum_grade: curriculum_grade, optional: false }, { _id: 1 }).lean();
    const gradeSubjectIds = gradeSubjects.map(subject => subject._id);
    return await SubjectTerm.find({ grade_subject: { $in: gradeSubjectIds } }).lean();
};
const GradeSectionController = {

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
            const { classification_grade, section_number, status } = req.body;
            const classificationGrade = await ClassificationGrade.findById(classification_grade);
            if (!classificationGrade) {
                return res.status(404).json({ message: 'Classification grade not found' });
            }
            const gradeSection = new GradeSection({ classification_grade, section_number, status });
            const savedGradeSection = await gradeSection.save();
            await registerSectionClasses(classificationGrade.curriculum_grade, savedGradeSection);
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

            const existingSectionTermClasses = await SectionClass.find({ grade_section: { $in: gradeSectionIds } })
                .select('grade_section subject_term');

            const sectionSubjectMap = new Map();
            gradeSectionIds.forEach(secId => sectionSubjectMap.set(secId.toString(), new Set()));

            existingSectionTermClasses.forEach(({ grade_section, subject_term }) => {
                sectionSubjectMap.get(grade_section.toString()).add(subject_term.toString());
            });

            const subjectTerms = await fetchSubjectTerms(classificationGrade.curriculum_grade);
            const subjectTermIds = subjectTerms.map(sub => sub._id.toString());

            const newSectionClasses = [];
            gradeSectionIds.forEach(secId => {
                const existingSubjects = sectionSubjectMap.get(secId.toString());
                subjectTermIds.forEach(subjectId => {
                    if (!existingSubjects.has(subjectId)) {
                        newSectionClasses.push({ grade_section: secId, subject_term: subjectId });
                    }
                });
            });

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
};

module.exports = GradeSectionController;
