const TermClass = require('../models/term-class');


const TermClassController = {
    getTermClassBySubject: async (req, res) => {
        try {
            const { section_subject } = req.params;
            const termClasses = await TermClass.find({ section_subject: section_subject })
                .populate({
                    path: 'subject_term',
                    populate: { path: 'grade_subject', populate: { path: 'subject', } },
                }).lean();
            res.status(200).json(termClasses);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
};

module.exports = TermClassController;

