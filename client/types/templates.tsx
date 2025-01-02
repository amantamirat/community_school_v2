import { Department, Grade } from "./model";

export const departmentTemplate = (department: Department) => {
    return (
        <>{department.name}</>
    );
};

export const gradeTemplate = (grade: Grade) => {
    let prefix = 'Grade ';
    if (grade.stage === 'KG') {
        prefix = 'KG ';
    }
    let suffix = "";
    if (grade.stage === 'PREP') {
        suffix = '(' + grade.specialization + ')'
    }
    return (
        <>{prefix + " - " + grade.level + " " + suffix}</>
    );
};