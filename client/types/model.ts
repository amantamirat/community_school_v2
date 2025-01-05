export type Sex = "Male" | "Female";

export type Department = {
    _id?: string;
    name: string;
};

export type Teacher = {
    _id?: string;
    department: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    sex: Sex;
    createdAt?: Date;
    updatedAt?: Date;
};

export type Grade = {
    _id?: string;
    stage: string;
    level: number;
    specialization: string;
};

export type Subject = {
    _id?: string;
    title: string;
    load: number;
    optional: boolean;
};


export type Curriculum = {
    _id?: string;
    title: string;
    classification: 'REGULAR' | 'EVENING' | 'DISTANCE';
    minimum_load: number;
    maximum_load: number;
    minimum_pass_mark: number;
    createdAt?: string;
    updatedAt?: string;
};

export type CurriculumGrade = {
    _id: string;
    curriculum:string;
    grade: string;
}

export type GradeSubject = {
    _id: string;
    curriculum_grade:string;
    subject: string;
}

export type SubjectWeight = {
    _id: string;
    grade_subject:string;
    weight: Number;
}

export type AcademicSession = {
    _id?: string;
    academic_year: number; // Year of the session, e.g., 2023
    start_date: Date | null;
    end_date: Date | null;
    status: 'ACTIVE' | 'CLOSED' | 'PLANNED'; // Session status
};

export type AdmissionClassification = {
    _id?: string;
    academic_session: string; // Year of the session
    classification: 'REGULAR' | 'EVENING' | 'DISTANCE';
    number_of_terms: number;
    curriculum: string; // Session status
};


