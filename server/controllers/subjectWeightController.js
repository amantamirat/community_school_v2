const SubjectWeight = require('../models/subject-weight');
const StudentResult = require('../models/student-result');
const GradeSubject = require('../models/grade-subject');
const SubjectWeightController = {

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
    // Create multiple SubjectWeight entries for a specific grade_subject
    createByGradeSubject: async (req, res) => {
        try {
            const subject_weights = req.body; // subject_weights should be an array of { grade_subject, assessment_type, assessment_weight }
            if (!Array.isArray(subject_weights) || subject_weights.length === 0) {
                return res.status(400).json({ message: 'Invalid input data. subject_weights must be a non-empty array.' });
            }
            // Calculate the sum of assessment_weight
            const totalWeight = subject_weights.reduce((sum, weight) => {
                return sum + (weight.assessment_weight || 0); // Add weight or default to 0 if undefined
            }, 0);

            const gradeSubject = await GradeSubject.findById(subject_weights[0].grade_subject).populate({
                path: 'curriculum_grade',
                populate: { path: 'curriculum'},
            });
            // Check if the total weight is 100
            if (totalWeight !== gradeSubject.curriculum_grade.curriculum.maximum_point) {
                return res.status(404).json({ message: `The total assessment weight must be ${gradeSubject.curriculum_grade.curriculum.maximum_point}.` });
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
            const subjectWeights = await SubjectWeight.find({ grade_subject: grade_subject }, { _id: 1 }).lean();
            const subjectWeightIds = subjectWeights.map(sub => sub._id);
            const referencedSubjectWeight = await StudentResult.exists({
                subject_weight: { $in: subjectWeightIds }
            });
            if (referencedSubjectWeight) {
                return res.status(400).json({
                    message: 'Deletion denied. One or more SubjectWeight entries are referenced in StudentResult.'
                });
            }
            const deletedCount = await SubjectWeight.deleteMany({ grade_subject });
            return res.status(200).json({ message: `Deleted ${deletedCount.deletedCount} entries.` });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: error.message });
        }
    },

    
};

module.exports = SubjectWeightController;
