const AdmissionClassification = require("../models/admission-classification");
const CurriculumGrade = require('../models/curriculum-grade');
const ClassificationGrade = require('../models/classification-grade');
const Curriculum = require('../models/curriculum');
const StudentGrade = require("../models/student-grade");
const GradeSection = require('../models/grade-sections');



// Controller functions
const AdmissionClassificationController = {
    // Create a new admissionClassification
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

    getAcademicSessionClassifications: async (req, res) => {
        try {
            const { academic_session } = req.params;
            const admissionClassifications = await AdmissionClassification.find({ academic_session: academic_session });
            res.status(200).json(admissionClassifications);
        } catch (error) {
            res.status(500).json({ message: error + "Error fetching admissionClassifications", error });
        }
    },


    // Delete a admissionClassification
    deleteAdmissionClassification: async (req, res) => {
        try {
            const { id } = req.params;
            const classificationGrades = await ClassificationGrade.find({ admission_classification: id });
            if (classificationGrades.length) {
                for (const grade of classificationGrades) {
                    const isReferencedInStudentGrade = await StudentGrade.exists({ classification_grade: grade._id });
                    if (isReferencedInStudentGrade) {
                        return res.status(400).json({
                            message: 'Cannot delete AdmissionClassification because its ClassificationGrade is referenced in StudentGrade.'
                        });
                    }
                    const isReferencedInGradeSection = await GradeSection.exists({ classification_grade: grade._id });

                    if (isReferencedInGradeSection) {
                        return res.status(400).json({
                            message: 'Cannot delete AdmissionClassification because its ClassificationGrade is referenced in GradeSection.'
                        });
                    }
                }
                const ack = await ClassificationGrade.deleteMany({ admission_classification: id });
                //console.log(ack, "classifcation grades cleared");
            }
            const admissionClassification = await AdmissionClassification.findByIdAndDelete(id);
            if (!admissionClassification) {
                return res.status(404).json({ message: "Admission Classifcation not found" });
            }
            res.status(200).json({ message: "Admission Classifcation deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = AdmissionClassificationController;
