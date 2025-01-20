const SectionClass = require("../models/section-class");

const SectionClassController = {

    createSectionClass: async (req, res) => {
        try {
            const { grade_section, grade_subject } = req.body;
            const newSectionClass = new SectionClass({ grade_section, grade_subject });
            await newSectionClass.save();
            res.status(201).json(newSectionClass);
        } catch (error) {
            res.status(500).json({ message: "Error creating Class", error });
        }
    },

    // Get all SectionClasss
    getAllSectionClasss: async (req, res) => {
        try {
            const SectionClasss = await SectionClass.find();
            res.status(200).json(SectionClasss);
        } catch (error) {
            res.status(500).json({ message: "Error fetching SectionClasss", error });
        }
    },

    getAllSectionClasssBySection: async (req, res) => {
        try {
            const { grade_section } = req.params;
            const SectionClasss = await SectionClass.find({ grade_section: grade_section }).populate('teacher').populate({
                path: 'grade_subject',
                populate: { path: 'subject', },
            });;
            res.status(200).json(SectionClasss);
        } catch (error) {
            res.status(500).json({ message: error + "Error fetching Classs", error });
        }
    },

    // Update a SectionClass
    updateSectionClass: async (req, res) => {
        try {
            const { id } = req.params;
            const { grade_section, grade_subject, teacher } = req.body;
            const updatedSectionClass = await SectionClass.findByIdAndUpdate(id, { grade_section, grade_subject, teacher }, { new: true });
            if (!updatedSectionClass) {
                return res.status(404).json({ message: "Class not found" });
            }
            res.status(200).json(updatedSectionClass);
        } catch (error) {
            res.status(500).json({ message: "Error updating Class", error });
        }
    },

    // Delete a SectionClass
    deleteSectionClass: async (req, res) => {
        try {
            const { id } = req.params;
            const exists = false;
            if (exists) {
                return res.status(400).json({
                    message: "Cannot delete the Class. It is associated.",
                });
            }
            const sectionClass = await SectionClass.findByIdAndDelete(id);
            if (!sectionClass) {
                return res.status(404).json({ message: "Class not found" });
            }
            res.status(200).json({ message: "class deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Error deleting class"+error});
        }
    }
};

module.exports = SectionClassController;
