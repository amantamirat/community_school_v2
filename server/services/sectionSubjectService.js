const SectionSubject = require('../models/section-subject');
const ClassificationGrade = require('../models/classification-grade');
const GradeSubject = require('../models/grade-subject');
const SubjectTerm = require('../models/subject-term');
const TermClass = require('../models/term-class');

const createSectionSubjects = async (gradeSection) => {
    try {
        const classificationGrade = await ClassificationGrade.findById(gradeSection.classification_grade).lean();
        const subjects = await GradeSubject.find({ curriculum_grade: classificationGrade.curriculum_grade, optional: false }).lean();
        const gradeSubjectIds = subjects.map(grdSubject => grdSubject._id);
        const sectionSubjects = gradeSubjectIds.map(gSubId => ({
            grade_section: gradeSection._id,
            grade_subject: gSubId
        }));
        const savedSectionSubjects = await SectionSubject.insertMany(sectionSubjects);
        
        if (savedSectionSubjects.length === 0) return;

        const subjectTerms = await SubjectTerm.find({ grade_subject: { $in: gradeSubjectIds } });
        const subjectTermMap = subjectTerms.reduce((acc, subjectTerm) => {
            if (!acc[subjectTerm.grade_subject]) {
                acc[subjectTerm.grade_subject] = [];
            }
            acc[subjectTerm.grade_subject].push(subjectTerm);
            return acc;
        }, {});

        const termClasses = savedSectionSubjects.flatMap(sectionSubject => {
            const terms = subjectTermMap[sectionSubject.grade_subject] || [];
            return terms.map(subjectTerm => ({
                section_subject: sectionSubject._id,
                subject_term: subjectTerm._id,
                status: subjectTerm.term === 1 ? 'ACTIVE' : 'PENDING',
            }));
        });
        await TermClass.insertMany(termClasses);
    } catch (error) {
        console.error("Error creating section subjects:", error);
        throw error;
    }
};

module.exports = {
    createSectionSubjects,
};
