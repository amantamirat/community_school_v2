const SectionSubject = require("../models/section-subject");


const SectionSubjectController = {
    getSectionSubjectsBySection: async (req, res) => {
        try {
            const { grade_section } = req.params;
            const sectionSubjects = await SectionSubject.find({ grade_section: grade_section })
                .populate('teacher')
                .populate({
                    path: 'grade_subject',
                    populate: { path: 'subject' },
                })
                .lean();
            res.status(200).json(sectionSubjects);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    allocateTeacher: async (req, res) => {
        try {
            const { id } = req.params;
            const { teacher } = req.body;

            const updatedSectionSubject = await SectionSubject.findOneAndUpdate(
                { _id: id, status: "ACTIVE" }, // Check if the status is "ACTIVE" in a single query
                { teacher },
                { new: true }
            );

            if (!updatedSectionSubject) {
                return res.status(404).json({ message: 'Section Subject not found or is not ACTIVE' });
            }

            res.status(200).json(updatedSectionSubject);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    removeTeacher: async (req, res) => {
        try {
            const { id } = req.params;

            const updatedSectionSubject = await SectionSubject.findOneAndUpdate(
                { _id: id, status: "ACTIVE" }, // Check if the status is "ACTIVE" in a single query
                { $unset: { teacher: 1 } },
                { new: true }
            );

            if (!updatedSectionSubject) {
                return res.status(404).json({ message: 'Section Subject not found or is not ACTIVE' });
            }

            res.status(200).json(updatedSectionSubject);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },
};

module.exports = SectionSubjectController;

