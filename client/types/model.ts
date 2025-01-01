

export type Sex = 'Male' | 'Female';

export type Department = {
    _id?: string;
    name: string;
    teachers?: {
        teacher: string;
    }[];
};

export let emptyDepartment: Department = {
    _id: '',
    name: '',
    teachers: [],
};

export type Teacher = {
    _id?: string;
    department: Department;
    first_name: string;
    middle_name: string;
    last_name: string;
    sex: Sex;
    createdAt?: Date;
    updatedAt?: Date;
};

export let emptyTeacher: Teacher = {
    _id: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    sex: 'Male', // Default sex value
    department: emptyDepartment, // Reference to department
};


export type Subject = {
    _id?: string;
    title: string;
    load: number;
    optional: boolean;
};

export let emptySubject: Subject = {
    _id: '',
    title: '',
    load: 0,
    optional: false
};


export type Curriculum = {
    _id?: string;
    title: string;
    minimum_load: number;
    maximum_load: number;
    minimum_pass_mark: number;
};

export let emptyCurriculum: Curriculum = {
    _id: '',
    title: '',
    minimum_load: 0,
    maximum_load: 0,
    minimum_pass_mark: 0,
};

export type Grade = {
    _id?: string;
    stage: string;
    level: number;
    specialization: string;
};


