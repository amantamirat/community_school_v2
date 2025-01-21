import { AcademicSession } from "@/types/model";
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

    async createAcademicSession(academicSession: AcademicSession): Promise<AcademicSession> {
        const createdData = await MyService.create(academicSession, create_endpoint);
        return createdData;

    },
    async updateAcademicSession(academicSession: Partial<AcademicSession>): Promise<AcademicSession> {
        if (academicSession._id) {
            const updatedAcademicSession = await MyService.update(academicSession._id, academicSession, update_endpoint);
            return updatedAcademicSession;
        }
        throw new Error("_id is required.");
    },

    async deleteAcademicSession(academicSession: AcademicSession): Promise<boolean> {
        if (academicSession._id) {
            const response = await MyService.delete(academicSession._id, delete_endpoint);
            return response;
        }
        throw new Error("_id is required.");
    },
};
