import { AcademicSession } from "@/types/model";
import { API_CONFIG } from "./apiConfig";
import { MyService } from "./MyService";

const get_endpoint = "/api/academic-sessions/";
const create_endpoint = '/api/academic-sessions/create';
const update_endpoint = '/api/academic-sessions/update';
const delete_endpoint = '/api/academic-sessions/delete';

export const AcademicSessionService = {
    async getAcademicSessions(): Promise<AcademicSession[]> {
        const data = await MyService.get(get_endpoint);
        return data as AcademicSession[];
    },

    async createAcademicSession(academicSession: Partial<AcademicSession>): Promise<AcademicSession> {
        const createdData = await MyService.create(academicSession, create_endpoint);
        return createdData;

    },
    async updateAcademicSession(id: string, academicSession: Partial<AcademicSession>): Promise<AcademicSession> {
        const updatedAcademicSession = await MyService.update(id, academicSession, update_endpoint);
        return updatedAcademicSession;
    },

    async deleteAcademicSession(id: string): Promise<boolean> {
        const response = await MyService.delete(id, delete_endpoint);
        return response;
    },
};
