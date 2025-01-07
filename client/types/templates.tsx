import { Curriculum, Department, Grade, Subject } from "./model";

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

export const subjectTemplate = (subject: Subject) => {
    return (
        <>{subject.title}-({subject.load})</>
    );
};

export const curriculumTemplate = (curriculum: Curriculum) => {
    return (
        <>{curriculum.title}-({curriculum.number_of_terms} terms per session)</>
    );
};
