const gradesList = require('../data/grades-list'); // Import the grades list

// Function to get the previous grade dynamically
function getPreviousGrade(stage, level, specialization) {
    // Find the current grade in the list
    const currentGrade = gradesList.find(grade => grade.stage === stage && grade.level === level && grade.specialization === specialization);

    if (!currentGrade) {
        return null; // Grade not found
    }
    // Handle the first grade (KG 1)
    if (stage === 'KG' && level === 1) {
        return null; // No previous grade for KG 1
    }
    // Handle grade 1 to KG-3
    if (stage === 'PRM_MID' && level===1){
        return gradesList.find(grade => grade.stage === 'KG' && grade.level === 3 && grade.specialization === 'GEN'); // Previous grade is KG 3
    }
    // Handle grade 11 to grade 10 PRIM_MID and GEN
    if (level === 11) {
        return gradesList.find(grade => grade.stage === 'PRM_MID' && grade.level === level - 1 && grade.specialization === 'GEN');
    }
    // Handle the rest of the grades   
    return gradesList.find(grade => grade.level === level - 1);
}

module.exports = { getPreviousGrade };
