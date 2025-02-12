const ClassificationGrade = require('../models/classification-grade');
const StudentGrade = require("../models/student-grade");
const GradeSection = require('../models/grade-sections');
const AdmissionClassification = require("../models/admission-classification");
const CurriculumGrade = require('../models/curriculum-grade');
const SectionSubject = require('../models/section-subject');
const { determineStudentStatus } = require('../services/studentGradeService');


// Controller methods
const ClassificationGradeController = {
    getClassificationGradesByClassification: async (req, res) => {
        try {
            const { admission_classification } = req.params;
            const classificationGrades = await ClassificationGrade.find({ admission_classification: admission_classification }).populate({
                path: 'curriculum_grade',
                populate: { path: 'grade', },
            });
            res.status(200).json(classificationGrades);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    openGrade: async (req, res) => {
        const { id } = req.params;
        const classificationGrade = await ClassificationGrade.findById(id);
        if (!classificationGrade) {
            return res.status(404).json({ message: 'Grade not found' });
        }
        if (classificationGrade.status === 'OPEN') {
            return res.status(400).json({ message: 'Grade already Open' });
        }

        const curriculumGrade = await CurriculumGrade.findById(classificationGrade.curriculum_grade);
        if (!curriculumGrade) return res.status(404).json({ message: 'Curriculum Grade not found' });

        const closedGrades = await ClassificationGrade.countDocuments({
            curriculum_grade: curriculumGrade._id,
            status: "CLOSED"
        });

        if (closedGrades === 0) {
            curriculumGrade.status = "ACTIVE";
            await curriculumGrade.save();
        }
        await StudentGrade.updateMany(
            { classification_grade: classificationGrade._id },
            { $set: { status: "ACTIVE", average_result: null } }
        );
        classificationGrade.status = "OPEN";
        const savedGrade = await classificationGrade.save();
        return res.status(200).json(savedGrade);
    },

    closeGrade: async (req, res) => {
        const { id } = req.params;
        const classificationGrade = await ClassificationGrade.findById(id);
        if (!classificationGrade) {
            return res.status(404).json({ message: 'Grade not found' });
        }
        if (classificationGrade.status === 'CLOSED') {
            return res.status(400).json({ message: 'Grade already closed' });
        }
        const gradeSections = await GradeSection.find({ classification_grade: id }).lean();
        if (gradeSections.length === 0) { return res.status(400).json({ message: 'Empty grade can not be closed.' }); }
        const hasOpenSection = gradeSections.some(sec => sec.status === 'OPEN');
        if (hasOpenSection) {
            return res.status(400).json({ message: 'Cannot close grade, open class found.' });
        }
        const gradeSectionIds = gradeSections.map(sec => sec._id);
        const sectionSubjects = await SectionSubject.find({ grade_section: { $in: gradeSectionIds } }).lean();
        const hasActiveSubject = sectionSubjects.some(subject => subject.status === 'ACTIVE');
        if (hasActiveSubject) {
            return res.status(400).json({ message: 'Cannot close grade, active class found' });
        }
        const curriculumGrade = await CurriculumGrade.findById(classificationGrade.curriculum_grade);
        if (!curriculumGrade) return res.status(404).json({ message: 'Curriculum Grade not found' });

        await determineStudentStatus(classificationGrade);
        if (curriculumGrade.status === 'ACTIVE') {
            curriculumGrade.status = "LOCKED";
            await curriculumGrade.save();
        }
        classificationGrade.status = "CLOSED";
        const savedGrade = await classificationGrade.save();
        return res.status(200).json(savedGrade);
    },

    syncCurriculumGrades: async (req, res) => {
        try {
            const { admission_classification } = req.params;
            const admissionClassification = await AdmissionClassification.findById(admission_classification).populate('curriculum');
            if (!admissionClassification) {
                return res.status(404).json({ message: 'Admission Classification not found' });
            }
            if (admissionClassification.status === 'CLOSED') return res.status(400).json({ message: 'Admission is closed' });
            const curriculumGrades = await CurriculumGrade.find({ curriculum: admissionClassification.curriculum });
            const existingClassificationGrades = await ClassificationGrade.find({ admission_classification }).select('curriculum_grade');
            const existingGradeIds = existingClassificationGrades.map(record => record.curriculum_grade.toString());
            const missingCurriculumGrades = curriculumGrades.filter(grade => !existingGradeIds.includes(grade._id.toString()));
            const classificationGradesToInsert = missingCurriculumGrades.map(grade => ({
                admission_classification,
                curriculum_grade: grade._id
            }));
            const insertedGrades = await ClassificationGrade.insertMany(classificationGradesToInsert);
            const savedClassificationGrades = await ClassificationGrade.find({
                _id: { $in: insertedGrades.map(grade => grade._id) }
            }).populate({
                path: 'curriculum_grade',
                populate: { path: 'grade' }
            });
            res.status(201).json(savedClassificationGrades);
        } catch (error) {
            res.status(400).json({ message: error.message });
            //console.log(error);
        }
    },


    deleteClassificationGrade: async (req, res) => {
        try {
            const { id } = req.params;
            const classificationGrade = await ClassificationGrade.findById(id);
            if (!classificationGrade) {
                return res.status(404).json({ message: 'Grade not found' });
            }
            const [studentGradeRef, gradeSectionRef] = await Promise.all([
                StudentGrade.exists({ classification_grade: id }),
                GradeSection.exists({ classification_grade: id })
            ]);

            if (Boolean(studentGradeRef) || Boolean(gradeSectionRef)) {
                return res.status(400).json({
                    message: 'Cannot delete Classification Grade because students are registered to the grade or section that has been created.'
                });
            }
            await ClassificationGrade.findByIdAndDelete(id);
            res.status(200).json({ message: 'Classification Grade deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

};

module.exports = ClassificationGradeController;
