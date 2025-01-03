import { AcademicSession } from "@/types/model";
import { API_CONFIG } from "./apiConfig";

export const AcademicSessionService = {
    async getAcademicSessions(): Promise<AcademicSession[]> {
        const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.getAcademicSessions}`;
        try {
            const response = await fetch(url, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || "Failed to fetch academicSessions");
                });
            }
            const data = await response.json();
            return data as AcademicSession[];
        } catch (error) {
            console.error('Error fetching academicSession data:', error);
            throw error;
        }
    },

    // Create a new academicSession
    async createAcademicSession(academicSession: Partial<AcademicSession>): Promise<AcademicSession> {
        const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.createAcademicSession}`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(academicSession),
        });
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.message || "Failed to create academicSession");
            });
        }
        const createdAcademicSession = await response.json();
        return createdAcademicSession;

    },

    async updateAcademicSession(id: string, academicSession: Partial<AcademicSession>): Promise<AcademicSession> {
        const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.updateAcademicSession}`;
        const response = await fetch(`${url}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(academicSession),
        });
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.message || "Failed to update academicSession");
            });
        }
        const updatedAcademicSession = await response.json();
        return updatedAcademicSession;
    },

    async deleteAcademicSession(id: string): Promise<boolean> {
        const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.deleteAcademicSession}`;
        const response = await fetch(`${url}/${id}`, {
            method: "DELETE",
        });
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.message || "Failed to delete academicSession");
            });
        }
        return response.status === 200;
    },
};
