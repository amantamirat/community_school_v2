import { GradeSubject, SubjectWeight } from "@/types/model";
import { MyService } from "./MyService";

const get_endpoint = "/api/subject-weights/";
const create_endpoint = '/api/subject-weights/create';
const delete_endpoint = '/api/subject-weights/delete';

export const SubjectWeightService = {
    async getSubjectWeights(grade_subject: GradeSubject): Promise<SubjectWeight[]> {
        if (grade_subject._id) {
            const url = `${get_endpoint}${grade_subject._id}`;
            const data = await MyService.get(url);
            return data as SubjectWeight[];
        }
        throw new Error('I told you, grade section _id is required');
    },

    async createSubjectWeights(subjectWeights: Partial<SubjectWeight[]>): Promise<SubjectWeight[]> {
        const createdData = await MyService.create(subjectWeights, create_endpoint);
        return createdData;

    },

    async deleteSubjectWeights(grade_subject: string): Promise<boolean> {
        const response = await MyService.delete(grade_subject, delete_endpoint);
        return response;
    },
};
