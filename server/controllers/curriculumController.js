const Curriculum = require('../models/curriculum');

// Controller methods
const CurriculumController = {
    // Create a new curriculum
    createCurriculum: async (req, res) => {
        try {
            const curriculum = new Curriculum(req.body);
            const savedCurriculum = await curriculum.save();
            res.status(201).json(savedCurriculum);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Get all curriculums
    getAllCurriculums: async (req, res) => {
        try {
            const curriculums = await Curriculum.find();
            res.status(200).json(curriculums);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },



    // Update a curriculum by ID
    updateCurriculum: async (req, res) => {
        try {
            const { id } = req.params;
            //extract except grades from req.body-to prevent grades being updated
            const { grades, ...updateData } = req.body;
            const updatedCurriculum = await Curriculum.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            );
            if (!updatedCurriculum) {
                return res.status(404).json({ message: 'Curriculum not found' });
            }
            res.status(200).json(updatedCurriculum);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Delete a curriculum by ID
    deleteCurriculum: async (req, res) => {
        try {
            const { id } = req.params;
            const deletedCurriculum = await Curriculum.findByIdAndDelete(id);
            if (!deletedCurriculum) {
                return res.status(404).json({ message: 'Curriculum not found' });
            }
            res.status(200).json({ message: 'Curriculum deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Add a grade to a curriculum
    addGrade: async (req, res) => {
        try {
            const { id } = req.params;
            const { grade } = req.body;
            const curriculum = await Curriculum.findById(id);
            if (!curriculum) {
                return res.status(404).json({ message: 'Curriculum not found' });
            }
            curriculum.grades.push({ grade });
            const updatedCurriculum = await curriculum.save();
            res.status(200).json(updatedCurriculum);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Remove a grade from a curriculum
    removeGrade: async (req, res) => {
        const { curriculumId, gradeId } = req.params;

        try {
            // Find the curriculum by ID
            const curriculum = await Curriculum.findById(curriculumId);
            if (!curriculum) {
                return res.status(404).json({ message: 'Curriculum not found' });
            }

            // Find the grade in the grades array and remove it
            const gradeIndex = curriculum.grades.findIndex(grade => grade._id.toString() === gradeId);
            if (gradeIndex === -1) {
                return res.status(404).json({ message: 'Grade not found in the curriculum' });
            }

            // Remove the grade from the array
            curriculum.grades.splice(gradeIndex, 1);

            // Save the updated curriculum
            await curriculum.save();

            return res.status(200).json(curriculum);
        } catch (error) {
            console.error('Error removing grade:', error);
            return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    },
    // Add a subject to a grade in a curriculum
    addSubject: async (req, res) => {
        try {
            const { id } = req.params;
            const { gradeId, subject } = req.body;
            const curriculum = await Curriculum.findById(id);
            if (!curriculum) {
                return res.status(404).json({ message: 'Curriculum not found' });
            }
            const grade = curriculum.grades.find(g => g.grade.toString() === gradeId);
            if (!grade) {
                return res.status(404).json({ message: 'Grade not found in curriculum' });
            }
            grade.subjects.push(subject);
            const updatedCurriculum = await curriculum.save();
            res.status(200).json(updatedCurriculum);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Remove a subject from a grade in a curriculum
    removeSubject: async (req, res) => {
        try {
            const { id } = req.params;
            const { gradeId, subjectId } = req.body;
            const curriculum = await Curriculum.findById(id);
            if (!curriculum) {
                return res.status(404).json({ message: 'Curriculum not found' });
            }
            const grade = curriculum.grades.find(g => g.grade.toString() === gradeId);
            if (!grade) {
                return res.status(404).json({ message: 'Grade not found in curriculum' });
            }
            grade.subjects = grade.subjects.filter(s => s.toString() !== subjectId);
            const updatedCurriculum = await curriculum.save();
            res.status(200).json(updatedCurriculum);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
};

module.exports = CurriculumController;
