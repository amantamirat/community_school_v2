const AdmissionClassification = require("../models/admission-classification");
const CurriculumGrade = require('../models/curriculum-grade');
const ClassificationGrade = require('../models/classification-grade');
const Curriculum = require('../models/curriculum');
const StudentGrade = require("../models/student-grade");
const GradeSection = require('../models/grade-sections');


const AdmissionClassificationController = {

    getAcademicSessionClassifications: async (req, res) => {
        try {
            const { academic_session } = req.params;
            const admissionClassifications = await AdmissionClassification.find({ academic_session: academic_session }).lean();
            res.status(200).json(admissionClassifications);
        } catch (error) {
            res.status(500).json({ message: error + "Error fetching admissionClassifications", error });
        }
    },

    createAdmissionClassification: async (req, res) => {
        try {
            const { academic_session, classification, curriculum } = req.body;

            const curriculumData = await Curriculum.findById(curriculum);
            if (!curriculumData) {
                return res.status(404).json({ message: 'Curriculum not found.' });
            }
            if (curriculumData.classification !== classification) {
                return res.status(400).json({
                    message: `The curriculum classification (${curriculumData.classification}) does not match the provided classification (${classification}).`
                });
            }
            const newAdmissionClassification = new AdmissionClassification({ academic_session, classification, curriculum });
            await newAdmissionClassification.save();
            const curriculumGrades = await CurriculumGrade.find({ curriculum: curriculum });
            const classificationGrades = curriculumGrades.map(curriculumGrade => ({
                admission_classification: newAdmissionClassification._id,
                curriculum_grade: curriculumGrade._id
            }));
            await ClassificationGrade.insertMany(classificationGrades);
            res.status(201).json(newAdmissionClassification);
        } catch (error) {
            res.status(500).json({ message: "Error creating admission Classification", error });
        }
    },

    openAdmission: async (req, res) => {
        const { id } = req.params;
        const admission = await AdmissionClassification.findById(id).populate('academic_session');
        if (!admission) {
            return res.status(404).json({ message: 'Admission not found' });
        }
        if (admission.status === 'OPEN') {
            return res.status(400).json({ message: 'Admission already Open' });
        }
        if (admission.academic_session.status === "CLOSED") return res.status(404).json({ message: 'Can not Open Admissoin, Session is Closed.' });
        admission.status = "OPEN";
        const savedAdmission = await admission.save();
        return res.status(200).json(savedAdmission);
    },

    closeAdmission: async (req, res) => {
        const { id } = req.params;
        const admission = await AdmissionClassification.findById(id);
        if (!admission) {
            return res.status(404).json({ message: 'Admission not found' });
        }
        if (admission.status === 'CLOSED') {
            return res.status(400).json({ message: 'Admission already closed' });
        }
        const grades = await ClassificationGrade.find({ admission_classification: id }).lean();
        if (grades.length === 0) { return res.status(400).json({ message: 'Empty admission can not be closed.' }); }
        const hasOpenGrade = grades.some(grd => grd.status === 'OPEN');
        if (hasOpenGrade) {
            return res.status(400).json({ message: 'Cannot close admission, open grade found' });
        }
        admission.status = "CLOSED";
        const savedAdmission = await admission.save();
        return res.status(200).json(savedAdmission);
    },

    // Delete a admissionClassification
    deleteAdmissionClassification: async (req, res) => {
        try {
            const { id } = req.params;
            const admissionClassification = await AdmissionClassification.findById(id);
            if (!admissionClassification) {
                return res.status(404).json({ message: "Admission Classifcation not found" });
            }
            const classificationGrades = await ClassificationGrade.find({ admission_classification: id }).lean();
            if (classificationGrades.length > 0) {
                const classifcatinGradeIds = classificationGrades.map(grade => grade._id);
                const [studentGradeRef, gradeSectionRef] = await Promise.all([
                    StudentGrade.exists({ classification_grade: { $in: classifcatinGradeIds } }),
                    GradeSection.exists({ classification_grade: { $in: classifcatinGradeIds } })
                ]);
                if (studentGradeRef || gradeSectionRef) {
                    return res.status(400).json({
                        message: 'Cannot delete Admission Classification because its Classification Grade is referenced in StudentGrade or GradeSection.'
                    });
                }
                await ClassificationGrade.deleteMany({ admission_classification: id });
            }
            await AdmissionClassification.findByIdAndDelete(id);
            res.status(200).json({ message: "Admission Classifcation deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = AdmissionClassificationController;
