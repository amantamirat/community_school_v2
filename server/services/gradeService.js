const Grade = require('../models/grade');

const getPreviousGrade = async (grade) => {
    try {
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
    } catch (error) {
        console.error("Error in getting prev Grade", error);
        throw error;
    }
};

const initializeGrades = async () => {
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
        const bulkOps = gradesList.map(grade => {
            const filter = { stage: grade.stage, level: grade.level };
            if (grade.specialization) filter.specialization = grade.specialization;

            return {
                updateOne: {
                    filter,
                    update: { $setOnInsert: grade },
                    upsert: true
                }
            };
        });

        await Grade.bulkWrite(bulkOps);
        console.log('Grades initialized...');
    } catch (error) {
        console.error('Error initializing grades:', error.message);
    }
};

module.exports = {
    getPreviousGrade, initializeGrades
};