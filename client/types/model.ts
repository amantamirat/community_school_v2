export type Department = {
    _id?: string;
    name: string;//change to department_name
};

export type Teacher = {
    _id?: string;
    department: string | Department;
    first_name: string;
    middle_name?: string;
    last_name: string;
    sex: "Male" | "Female";
    photo?: string;
    uid?: User | string;
};
export type Role = 'Administrator' | 'Principal' | 'Teacher' | 'Student';
export type User = {
    id?: string;
    _id?: string;
    username: string;
    password?: string;
    email?: string;
    roles?: Role[];
    photo?: string;
};

export type Grade = {
    _id?: string;
    stage: "KG" | "GRADE";
    level: number;
    specialization?: "NAT" | "SOC";
};

export type Subject = {
    _id?: string;
    title: string;
    load: number;
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
    _id?: string;
    curriculum: string | Curriculum;
    grade: string | Grade;
    status: 'ACTIVE' | 'LOCKED';
}

export type GradeSubject = {
    _id?: string;
    curriculum_grade: string | CurriculumGrade;
    subject: string | Subject;
    optional: boolean;
}

export type SubjectWeight = {
    _id?: string;
    grade_subject: string | GradeSubject;
    assessment_type: 'Quiz' | 'Assignment' | 'Test' | 'Mid-Exam' | 'Final-Exam'
    assessment_weight: number;
}

export type SubjectTerm = {
    _id?: string;
    grade_subject: string | GradeSubject;
    term: number;
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
    academic_session: AcademicSession | string;
    classification: 'REGULAR' | 'EVENING' | 'DISTANCE';
    curriculum: Curriculum | string;
    status?: 'OPEN' | 'CLOSED';
};

export type ClassificationGrade = {
    _id?: string;
    admission_classification: AdmissionClassification | string;
    curriculum_grade: CurriculumGrade | string;
    status: 'OPEN' | 'CLOSED';
};

export type GradeSection = {
    _id?: string;
    classification_grade: ClassificationGrade | string;
    section_number: number;
    number_of_seat: number;
    status: 'OPEN' | 'CLOSED';
};

export type SectionSubject = {
    _id?: string;
    grade_section: GradeSection | string;
    grade_subject: GradeSubject | string;
    teacher?: Teacher | string;
    status: 'ACTIVE' | 'CLOSED';
};

export type TermClass = {
    _id?: string;
    section_subject: SectionSubject | string;
    subject_term: SubjectTerm | string;
    status: 'ACTIVE' | 'SUBMITTED' | 'APPROVED' | 'PENDING';
};

export type Student = {
    _id?: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    sex: "Male" | "Female";
    birth_date: Date | null;
    has_perior_school_info: boolean;
    photo?: string;
    registered?: boolean;
};

export type ExternalStudentInfo = {
    _id?: string;
    student: Student | string;
    school_name: string;
    academic_year: number;
    classification: 'REGULAR' | 'EVENING' | 'DISTANCE';
    grade: Grade | string;
    average_result: number;
    status: 'PROMOTED' | 'FAILED';
    transfer_reason?: string;
    registered?: boolean
};
export type StudentGrade = {
    _id?: string;
    classification_grade: ClassificationGrade | string;
    student: Student | string;
    status: 'ACTIVE' | 'PROMOTED' | 'FAILED' | 'INCOMPLETE';
    grade_section?: GradeSection | string;
    external_student_prior_info?: ExternalStudentInfo | string;
    previous_student_grade?: StudentGrade | string;
    student_type?: "New" | "External" | "Returned"
};

export type StudentClass = {
    _id?: string;
    student_grade: StudentGrade | string;
    term_class: TermClass | string;
    status: 'ACTIVE' | 'COMPLETED' | 'INCOMPLETE';
};

export type StudentResult = {
    _id?: string;
    student_class: StudentClass | string;
    subject_weight: SubjectWeight | string;
    result: number;
    status: 'ACTIVE' | 'CLOSED';
};


