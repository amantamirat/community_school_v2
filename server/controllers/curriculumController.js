const Curriculum = require('../models/curriculum');
const AdmissionClassification = require("../models/admission-classification");
const CurriculumGrade = require('../models/curriculum-grade');
const GradeSubject = require('../models/grade-subject');
const SubjectTerm = require('../models/subject-term');

// Controller methods
const CurriculumController = {
    // Create a new curriculum
    createCurriculum: async (req, res) => {
        try {
            const { title, classification, number_of_terms, maximum_point, minimum_pass_mark } = req.body;
            const curriculum = new Curriculum({ title, classification, number_of_terms, maximum_point, minimum_pass_mark });
            const savedCurriculum = await curriculum.save();
            res.status(201).json(savedCurriculum);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Get all curriculums
    getCurriculums: async (req, res) => {
        try {
            const curriculums = await Curriculum.find();
            res.status(200).json(curriculums);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Update a curriculum by ID
    updateCurriculum: async (req, res) => {
        try {
            const { id } = req.params;
            const classificationExist = await AdmissionClassification.exists({ curriculum: id });
            if (classificationExist) {
                return res.status(400).json({
                    message: "Cannot update, classification Exists. It is associated with one or more admission classification.",
                });
            }
            const existingCurriculum = await Curriculum.findById(id);
            if (!existingCurriculum) {
                return res.status(404).json({ message: "Curriculum not found." });
            }
            const { title, classification, number_of_terms, maximum_point, minimum_pass_mark } = req.body;
            
            //update subjectTerms based on number_of_terms
            const oldNumberOfTerms = existingCurriculum.number_of_terms;
            if (oldNumberOfTerms !== number_of_terms) {
                const curriculumGrades = await CurriculumGrade.find({ curriculum: id }).select('_id');
                const curriculumGradeIds = curriculumGrades.map(cg => cg._id);
                const gradeSubjects = await GradeSubject.find({ curriculum_grade: { $in: curriculumGradeIds } }).select('_id');
                const gradeSubjectIds = gradeSubjects.map(gs => gs._id);
                if (oldNumberOfTerms > number_of_terms) {
                    // If decreasing, delete SubjectTerms that exceed new number_of_terms
                    await SubjectTerm.deleteMany({
                        grade_subject: { $in: gradeSubjectIds },
                        term: { $gt: number_of_terms }
                    });
                } else {
                    // If increasing, add missing SubjectTerms
                    const newSubjectTerms = [];
                    for (const gradeSubjectId of gradeSubjectIds) {
                        for (let term = oldNumberOfTerms + 1; term <= number_of_terms; term++) {
                            newSubjectTerms.push({ grade_subject: gradeSubjectId, term });
                        }
                    }
                    if (newSubjectTerms.length > 0) {
                        await SubjectTerm.insertMany(newSubjectTerms);
                    }
                }
            }
            const updatedCurriculum = await Curriculum.findByIdAndUpdate(
                id,
                { title, classification, number_of_terms, maximum_point, minimum_pass_mark },
                { new: true}
            );
            if (!updatedCurriculum) {
                return res.status(404).json({ message: 'Curriculum not found' });
            }
            res.status(200).json(updatedCurriculum);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Delete a curriculum by ID
    deleteCurriculum: async (req, res) => {
        try {
            const { id } = req.params;
            const classificationExist = await AdmissionClassification.exists({ curriculum: id });
            if (classificationExist) {
                return res.status(400).json({
                    message: "Cannot delete, classification Exists. It is associated with one or more admission classification.",
                });
            }
            const gradeExist = await CurriculumGrade.exists({ curriculum: id });
            if (gradeExist) {
                return res.status(400).json({
                    message: "Cannot delete, grade exist. It is associated with one or more curriculum grade.",
                });
            }
            const deletedCurriculum = await Curriculum.findByIdAndDelete(id);
            if (!deletedCurriculum) {
                return res.status(404).json({ message: 'Curriculum not found' });
            }
            res.status(200).json({ message: 'Curriculum deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
};

module.exports = CurriculumController;
