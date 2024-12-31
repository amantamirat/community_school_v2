import { Department } from "@/types/model";
import { API_CONFIG } from "./apiConfig";

export const DepartmentService = {
    async getDepartments(): Promise<Department[]> {
        const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.getDepartments}`;
        try {
            const response = await fetch(url, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch departments: ${response.statusText}`);
            }

            const data = await response.json();
            return data as Department[];
        } catch (error) {
            console.error('Error fetching department data:', error);
            throw error;
        }
    },
};
