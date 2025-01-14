export type Department = {
    _id?: string;
    name: string;
};

export type Teacher = {
    _id?: string;
    department: string | Department;
    first_name: string;
    middle_name: string;
    last_name: string;
    sex: "Male" | "Female";
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
    number_of_terms: number;
    maximum_point: number;
    minimum_pass_mark: number;
    createdAt?: string;
    updatedAt?: string;
};

export type CurriculumGrade = {
    _id: string;
    curriculum: string;
    grade: string;
}

export type GradeSubject = {
    _id: string;
    curriculum_grade: string;
    subject: string;
}

export type SubjectWeight = {
    _id?: string;
    grade_subject: string;
    assessment_type: 'Quiz' | 'Assignment' | 'Test' | 'Mid-Exam' | 'Final-Exam'
    assessment_weight: number;
}

export type AcademicSession = {
    _id: string;
    academic_year: number; // Year of the session, e.g., 2023
    start_date: Date | null;
    end_date: Date | null;
    status: 'ACTIVE' | 'CLOSED' | 'PLANNED'; // Session status
};

export type AdmissionClassification = {
    _id: string;
    academic_session: AcademicSession | string;
    classification: 'REGULAR' | 'EVENING' | 'DISTANCE';
    curriculum: Curriculum | string;
};

export type ClassificationGrade = {
    _id?: string;
    admission_classification: AdmissionClassification | string;
    curriculum_grade: CurriculumGrade | string;
};

export type GradeSection = {
    _id?: string;
    classification_grade: ClassificationGrade | string;
    section: number;
};

export type SectionClass = {
    _id?: string;
    grade_section: GradeSection | string;
    grade_subject: GradeSubject | string;
    teacher?: Teacher | string;
};

export type Student = {
    _id?: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    sex: "Male" | "Female";
    birth_date: Date | null;
};

export type ExternalStudentInfo = {
    _id?: string;
    student: Student | string;
    school_name: string;
    academic_year: number;
    classification: 'REGULAR' | 'EVENING' | 'DISTANCE';
    grade: Grade | string;
    average_result: number;
    status: 'PASSED' | 'FAILED' | 'INCOMPLETE';
    transferReason: string;
};



