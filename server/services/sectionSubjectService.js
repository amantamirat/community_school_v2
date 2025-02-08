const SectionSubject = require('../models/section-subject');
const ClassificationGrade = require('../models/classification-grade');
const GradeSubject = require('../models/grade-subject');
const SubjectTerm = require('../models/subject-term');
const TermClass = require('../models/term-class');
const GradeSection = require('../models/grade-sections');
const StudentClass = require('../models/student-class');

const createSectionSubjectsByGradeSection = async (gradeSection) => {
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
        return await TermClass.insertMany(termClasses);
    } catch (error) {
        console.error("Error creating section subjects:", error);
        throw error;
    }
};


const removeSectionSubjects = async (gradeSection) => {
    try {
        const sectionSubjectsIds = await SectionSubject.distinct('_id', { gradeSection: gradeSection._id });
        await TermClass.deleteMany({ section_subject: { $in: sectionSubjectsIds } });
        await SectionSubject.deleteMany({ grade_section: gradeSection.id });
    } catch (error) {
        console.error("Error removing section subjects:", error);
        throw error;
    }
};


const createSectionSubjectsByGradeSubject = async (curriculumGrade, gradeSubject, subjectTerms) => {
    try {
        const classificationGrades = await ClassificationGrade.find({ curriculum_grade: curriculumGrade._id }).lean();
        const classificationGradeIds = classificationGrades.map(grade => grade._id);
        const gradeGections = await GradeSection.find({ classification_grade: { $in: classificationGradeIds } }).lean();
        const gradeSectionIds = gradeGections.map(sec => sec._id);
        const sectionSubjects = gradeSectionIds.map(sec => ({
            grade_section: sec,
            grade_subject: gradeSubject._id
        }));
        const savedSectionSubjects = await SectionSubject.insertMany(sectionSubjects);
        const termClasses = savedSectionSubjects.flatMap(sectionSubject => {
            return subjectTerms.map(subjectTerm => ({
                section_subject: sectionSubject._id,
                subject_term: subjectTerm._id,
                status: subjectTerm.term === 1 ? 'ACTIVE' : 'PENDING',
            }));
        });
        return await TermClass.insertMany(termClasses);
    } catch (error) {
        console.error("Error creating section subjects:", error);
        throw error;
    }
};

const removeSectionSubjectsByGradeSubject = async (gradeSubject) => {
    try {

        const sectionSubjects = await SectionSubject.find({ grade_subject: gradeSubject._id }).lean();
        if (!sectionSubjects.length) return;
        if (sectionSubjects.some(subject => subject.teacher !== null && subject.teacher !== undefined)) {
            throw new Error('Cannot remove subject, teacher is assigned');
        }
        const sectionSubjectIds = sectionSubjects.map(sub => sub._id);

        /*
        //but if there is no weight it can not be closed so you can skip this checking
        if (sectionSubjects.some(subject => subject.status === 'CLOSED')) {
            throw new Error('Cannot remove subject, closed class found');
        }
        // Again if there is no weght it can't be submitted or approved, so uncessarly work here
        const termClasses = await TermClass.find({ section_subject: { $in: sectionSubjectIds } }).lean();
        if (termClasses.some(term => ['SUBMITTED', 'APPROVED'].includes(term.status))) {
            throw new Error('Cannot remove terms, submitted or approved term found.');
        }
        */
        const termClassIds = await TermClass.distinct('_id', { section_subject: { $in: sectionSubjectIds } });            
        await StudentClass.deleteMany({ term_class: { $in: termClassIds } });
        await TermClass.deleteMany({ _id: { $in: termClassIds } });
        await SectionSubject.deleteMany({ _id: { $in: sectionSubjectIds } });
    } catch (error) {
        // console.error("Error removing section subjects:", error);
        throw error;
    }
};

module.exports = {
    createSectionSubjectsByGradeSection, createSectionSubjectsByGradeSubject,
    removeSectionSubjects, removeSectionSubjectsByGradeSubject
};
