const StudentClass = require('../models/student-class');
const StudentResult = require("../models/student-result");

const StudentResultController = {

    getStudentResultsBySectionClass: async (req, res) => {
        try {
            const { section_class, term } = req.params;
            const studentClasses = await StudentClass.find({ section_class: section_class});
            const studentClassIds = studentClasses.map((studentClass) => studentClass._id);
            const studentResults = await StudentResult.find({ student_class: { $in: studentClassIds }, term: term  });
            return res.status(200).json(studentResults);;
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Delete a studentClass by ID
    deleteStudentClass: async (req, res) => {
        try {
            const { id } = req.params;
            const isReferencedInStudentResult = await StudentResult.exists({ student_class: id });
            if (isReferencedInStudentResult) {
                return res.status(400).json({
                    message: 'Cannot delete Student Class, it is referenced in Result.'
                });
            }
            const deletedStudentClass = await StudentClass.findByIdAndDelete(id);
            if (!deletedStudentClass) {
                return res.status(404).json({ message: 'Student Class not found' });
            }
            res.status(200).json({ message: 'Student Class deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
};

module.exports = StudentResultController;
