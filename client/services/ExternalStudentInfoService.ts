import { ExternalStudentInfo } from "@/types/model";
import { MyService } from "./MyService";

const get_endpoint = "/api/external-student-info/";
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

    async updateExternalStudentInfo(id: string, student: Partial<ExternalStudentInfo>): Promise<ExternalStudentInfo> {
        const updatedExternalStudentInfo = await MyService.update(id, student, update_endpoint);
        return updatedExternalStudentInfo;
    },

    async deleteExternalStudentInfo(id: string): Promise<boolean> {
        const response = await MyService.delete(id, delete_endpoint);
        return response;
    },
};
