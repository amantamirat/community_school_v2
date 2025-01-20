const SubjectWeight = require('../models/subject-weight');

const SubjectWeightController = {
    // Create multiple SubjectWeight entries for a specific grade_subject
    createByGradeSubject: async (req, res) => {
        try {
            const subject_weights = req.body; // subject_weights should be an array of { grade_subject, assessment_type, assessment_weight }
            if (!Array.isArray(subject_weights) || subject_weights.length === 0) {
                return res.status(400).json({ message: 'Invalid input data. subject_weights must be a non-empty array.' });
            }
            const createdEntries = await SubjectWeight.insertMany(subject_weights);
            return res.status(201).json(createdEntries);
        } catch (error) {
            //console.error(error);
            return res.status(500).json({ message: error + 'Failed to create SubjectWeight entries.' });
        }
    },

    // Delete all SubjectWeight entries for a specific grade_subject
    deleteByGradeSubject: async (req, res) => {      
        try {
            const { grade_subject } = req.params;

            if (!grade_subject) {
                return res.status(400).json({ message: 'grade_subject is required.' });
            }
            const deletedCount = await SubjectWeight.deleteMany({ grade_subject });
            return res.status(200).json({ message: `Deleted ${deletedCount.deletedCount} entries.` });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: error });
        }
    },

    // Get all SubjectWeight entries for a specific grade_subject
    getByGradeSubject: async (req, res) => {
        const { grade_subject } = req.params;
        if (!grade_subject) {
            return res.status(400).json({ message: 'grade_subject is required.' });
        }
        try {
            const subjectWeights = await SubjectWeight.find({ grade_subject: grade_subject });
            return res.status(200).json(subjectWeights);
        } catch (error) {
            //console.error(error);
            return res.status(500).json({ message: 'Failed to retrieve SubjectWeight entries.' });
        }
    },
};

module.exports = SubjectWeightController;
