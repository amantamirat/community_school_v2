const GradeSubject = require('../models/grade-subject');  // Adjust the path based on your file structure

// Create a new GradeSubject
exports.createGradeSubject = async (req, res) => {
    try {
        const { curriculum_grade, subject, optional } = req.body;
        // Create a new grade-subject relationship
        const newGradeSubject = new GradeSubject({
            curriculum_grade,
            subject,
            optional
        });

        // Save to the database
        await newGradeSubject.save();
        res.status(201).json(newGradeSubject);
    } catch (err) {
        res.status(500).json({ message: 'Error creating GradeSubject', error: err });
    }
};

// Get all GradeSubjects by curriculum_grade
exports.getGradeSubjectsByCurriculumGrade = async (req, res) => {
    try {
        const gradeSubjects = await GradeSubject.find({ curriculum_grade: req.params.curriculum_grade });
        res.status(200).json(gradeSubjects);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching GradeSubjects', error: err });
    }
};

// Update a GradeSubject
exports.updateGradeSubject = async (req, res) => {
    try {        
        const { curriculum_grade, subject, optional } = req.body;
        const updatedGradeSubject = await GradeSubject.findByIdAndUpdate(
            req.params.id,
            { curriculum_grade, subject, optional },
            { new: true }
        );
        if (!updatedGradeSubject) {
            return res.status(404).json({ message: 'GradeSubject not found' });
        }
        res.status(200).json(updatedGradeSubject);
    } catch (err) {
        res.status(500).json({ message: 'Error updating GradeSubject', error: err });
    }
};


exports.getGradeSubjectById = async (req, res) => {
    try {
        const gradeSubject = await GradeSubject.findById(req.params.id);
        if (!gradeSubject) {
            return res.status(404).json({ message: 'GradeSubject not found' });
        }
        res.status(200).json(gradeSubject);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching GradeSubject', error: err });
    }
};

// Delete a GradeSubject
exports.deleteGradeSubject = async (req, res) => {
    try {
        const deletedGradeSubject = await GradeSubject.findByIdAndDelete(req.params.id);

        if (!deletedGradeSubject) {
            return res.status(404).json({ message: 'GradeSubject not found' });
        }

        res.status(200).json(deletedGradeSubject);
    } catch (err) {
        res.status(500).json({ message: 'Error deleting GradeSubject', error: err });
    }
};
