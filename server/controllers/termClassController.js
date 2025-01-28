const TermClass = require("../models/term-class");

const TermClassController = {
    getTermClassesBySectionClass: async (req, res) => {
        try {
            const { section_class } = req.params;
            const termClasses = await TermClass.find({ section_class: section_class });
            return res.status(200).json(termClasses);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
};

module.exports = TermClassController;
