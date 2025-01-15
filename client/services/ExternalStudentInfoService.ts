import { ClassificationGrade, ExternalStudentInfo, Student } from "@/types/model";
import { MyService } from "./MyService";

const get_endpoint = "/api/external-student-info/";
const get_by_student_endpoint = "/api/external-student-info/student";
const get_by_classification_grade_endpoint = "/api/external-student-info/classification_grade";
const create_endpoint = '/api/external-student-info/create';
const update_endpoint = '/api/external-student-info/update';
const delete_endpoint = '/api/external-student-info/delete';

export const ExternalStudentInfoService = {
    async getExternalStudentInfos(): Promise<ExternalStudentInfo[]> {
        const data = await MyService.get(get_endpoint);
        return data as ExternalStudentInfo[];
    },

    async createExternalStudentInfo(student: Partial<ExternalStudentInfo>): Promise<ExternalStudentInfo> {
        const createdData = await MyService.create(student, create_endpoint);
        return createdData;
    },

    async getExternalInfoByStudent(student: Student): Promise<ExternalStudentInfo> {
        const endpoint = `${get_by_student_endpoint}/${student._id}`;
        const data = await MyService.get(endpoint);
        return data;
    },

    async getExternalElligibleStudentsByGrade(classification_grade: ClassificationGrade): Promise<ExternalStudentInfo[]> {
        const endpoint = `${get_by_classification_grade_endpoint}/${classification_grade._id}`;
        const data = await MyService.get(endpoint);
        return data;
    },    

    async updateExternalStudentInfo(id: string, student: Partial<ExternalStudentInfo>): Promise<ExternalStudentInfo> {
        const updatedExternalStudentInfo = await MyService.update(id, student, update_endpoint);
        return updatedExternalStudentInfo;
    },

    async deleteExternalStudentInfo(id: string): Promise<boolean> {
        const response = await MyService.delete(id, delete_endpoint);
        return response;
    },
};
