

export type Sex = 'Male' | 'Female';

export type Department = {
    _id?: string;
    name: string;
    teachers?: {
        teacher: string;
    }[];
};

export type Teacher = {
    _id?: string;
    department?: string;
    first_name: string;
    last_name: string;
    sex?: Sex;
};