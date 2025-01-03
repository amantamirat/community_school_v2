const Grade = require('../models/grade'); // Import the Grade model

exports.getAllGrades = async (req, res) => {
    try {
        const grades = await Grade.find();
        res.status(200).json(grades);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching grades', error });
    }
};

exports.getGradeById = async (req, res) => {
    try {
        const grade = await Grade.findById(req.params.id);
        if (!grade) {
            return res.status(404).json({ message: 'Grade not found' });
        }
        res.status(200).json(grade);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching grade', error });
    }
};

exports.initializeGrades = async () => {
    const gradesList = [
        { stage: 'KG', level: 1, specialization: 'GEN' },
        { stage: 'KG', level: 2, specialization: 'GEN' },
        { stage: 'KG', level: 3, specialization: 'GEN' },
        { stage: 'PRM_MID', level: 1, specialization: 'GEN' },
        { stage: 'PRM_MID', level: 2, specialization: 'GEN' },
        { stage: 'PRM_MID', level: 3, specialization: 'GEN' },
        { stage: 'PRM_MID', level: 4, specialization: 'GEN' },
        { stage: 'PRM_MID', level: 5, specialization: 'GEN' },
        { stage: 'PRM_MID', level: 6, specialization: 'GEN' },
        { stage: 'PRM_MID', level: 7, specialization: 'GEN' },
        { stage: 'PRM_MID', level: 8, specialization: 'GEN' },
        { stage: 'PRM_MID', level: 9, specialization: 'GEN' },
        { stage: 'PRM_MID', level: 10, specialization: 'GEN' },
        { stage: 'PREP', level: 11, specialization: 'NAT' },
        { stage: 'PREP', level: 12, specialization: 'NAT' },
        { stage: 'PREP', level: 11, specialization: 'SOC' },
        { stage: 'PREP', level: 12, specialization: 'SOC' }
    ];
    try {
        for (const grade of gradesList) {
            await Grade.updateOne(
                { stage: grade.stage, level: grade.level, specialization: grade.specialization },
                { $setOnInsert: grade },
                { upsert: true } // Inserts the document only if it doesn't already exist
            );
        }
        console.log('Grades initialized...');
    } catch (error) {
        console.error('Error initializing grades:', error.message);
    }
};


async function getPreviousGrade(stage, level, specialization) {
    try {
        // Fetch the current grade from the database
        const currentGrade = await Grade.findOne({ stage, level, specialization });
        if (!currentGrade) {
            return null; // Grade not found
        }
        // Handle the first grade (KG 1)
        if (stage === 'KG' && level === 1) {
            return null; // No previous grade for KG 1
        }
        // Handle grade 1 in PRM_MID (previous is KG 3)
        if (stage === 'PRM_MID' && level === 1) {
            return await Grade.findOne({ stage: 'KG', level: 3, specialization: 'GEN' });
        }
        // Handle grade 11 in PREP (previous is PRM_MID 10)
        if (stage === 'PREP' && level === 11) {
            return await Grade.findOne({ stage: 'PRM_MID', level: 10, specialization: 'GEN' });
        }
        // Handle the rest of the grades
        return await Grade.findOne({ stage, level: level - 1, specialization });
    } catch (error) {
        throw new Error('Error fetching the previous grade: ' + error.message);
    }
}

// Controller method to fetch the previous grade
exports.getPreviousGrade = async (req, res) => {
    const { stage, level, specialization } = req.body;
    try {
        const previousGrade = await getPreviousGrade(stage, level, specialization);
        if (!previousGrade) {
            return res.status(404).json({ message: 'No previous grade found for the given input.' });
        }
        res.status(200).json(previousGrade);
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while fetching the previous grade.', error: error.message });
    }
};







