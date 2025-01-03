export type Sex = 'Male' | 'Female';

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

export type Subject = {
    _id?: string;
    title: string;
    load: number;
    optional: boolean;
};


export type Curriculum = {
    _id?: string;
    title: string;
    minimum_load: number;
    maximum_load: number;
    minimum_pass_mark: number;
    grades: {
        _id?: string
        grade: string;
        subjects?: {
            _id?: string
            subject: string;
        }[];
    }[];
    createdAt?: string;
    updatedAt?: string;
};

export type Grade = {
    _id?: string;
    stage: string;
    level: number;
    specialization: string;
};

export type CurriculumGrade = {
    _id?: string;
    grade: string;
    subjects: {
        subject: string;
    }[];
}


