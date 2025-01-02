import { Curriculum } from "@/types/model";
import { API_CONFIG } from "./apiConfig";

export const CurriculumService = {
    async getCurriculums(): Promise<Curriculum[]> {
        const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.getCurricula}`;
        try {
            const response = await fetch(url, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch curriculums: ${response.statusText}`);
            }
            const data = await response.json();
            return data as Curriculum[];
        } catch (error) {
            console.error('Error fetching curriculum data:', error);
            throw error;
        }
    },

    // Create a new curriculum
    async createCurriculum(curriculum: Partial<Curriculum>): Promise<Curriculum> {
        const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.createCurriculum}`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(curriculum),
        });
        if (!response.ok) {
            throw new Error("Failed to create curriculum");
        }
        const createdCurriculum = await response.json();
        return createdCurriculum;

    },

    async updateCurriculum(id: string, curriculum: Partial<Curriculum>): Promise<Curriculum> {
        const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.updateCurriculum}`;
        const response = await fetch(`${url}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(curriculum),
        });
        if (!response.ok) {
            throw new Error("Failed to update curriculum");
        }
        const updatedCurriculum = await response.json();
        return updatedCurriculum;
    },

    async deleteCurriculum(id: string): Promise<boolean> {
        const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.deleteCurriculum}`;
        const response = await fetch(`${url}/${id}`, {
            method: "DELETE",
        });
        if (!response.ok) {
            throw new Error("Failed to delete curriculum");
        }
        return response.status === 200;
    },

    async addGrade(curriculumId: string, grade: string): Promise<Curriculum> {
        const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.addGrade}`;
        const response = await fetch(`${url}/${curriculumId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ grade }),
        });
        if (!response.ok) {
            throw new Error("Failed to add grade");
        }
        const updatedCurriculum = await response.json();
        return updatedCurriculum;
    },

    async removeGrade(curriculumId: string, gradeId: string): Promise<Curriculum> {
        const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.removeGrade}`;
        const response = await fetch(`${url}/${curriculumId}`, {
            method: "DELETE",
            body: JSON.stringify({ gradeId }),
        });
        if (!response.ok) {
            throw new Error("Failed to remove curriculum grade");
        }
        const updatedCurriculum = await response.json();
        return updatedCurriculum;
    },

};
