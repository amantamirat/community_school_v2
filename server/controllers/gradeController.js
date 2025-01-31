const Grade = require('../models/grade'); // Import the Grade model

getAllGrades = async (req, res) => {
    try {
        const grades = await Grade.find();
        res.status(200).json(grades);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching grades', error });
    }
};

getGradeById = async (req, res) => {
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



initializeGrades = async () => {
    const gradesList = [
        { stage: 'KG', level: 1 },
        { stage: 'KG', level: 2 },
        { stage: 'KG', level: 3 },
        { stage: 'GRADE', level: 1 },
        { stage: 'GRADE', level: 2 },
        { stage: 'GRADE', level: 3 },
        { stage: 'GRADE', level: 4 },
        { stage: 'GRADE', level: 5 },
        { stage: 'GRADE', level: 6 },
        { stage: 'GRADE', level: 7 },
        { stage: 'GRADE', level: 8 },
        { stage: 'GRADE', level: 9 },
        { stage: 'GRADE', level: 10 },
        { stage: 'GRADE', level: 11, specialization: 'NAT' },
        { stage: 'GRADE', level: 11, specialization: 'SOC' },
        { stage: 'GRADE', level: 12, specialization: 'NAT' },
        { stage: 'GRADE', level: 12, specialization: 'SOC' }
    ];
    try {
        for (const grade of gradesList) {
            const filter = { stage: grade.stage, level: grade.level };
            if (grade.specialization) filter.specialization = grade.specialization;

            await Grade.updateOne(
                filter,
                { $setOnInsert: grade },
                { upsert: true }
            );
        }
        console.log('Grades initialized...');
    } catch (error) {
        console.error('Error initializing grades:', error.message);
    }
};

async function getPreviousGrade(grade) {
    if (grade.level === 1) {
        if (grade.stage === "KG") {
            return null;
        }
        return await Grade.findOne({ stage: "KG", level: 3 });
    }
    else if (grade.level === 12) {
        return await Grade.findOne({ stage: "GRADE", level: 11, specialization: grade.specialization });
    }
    return await Grade.findOne({ stage: grade.stage, level: grade.level - 1 });
}


module.exports = { getAllGrades, getGradeById, initializeGrades, getPreviousGrade };







