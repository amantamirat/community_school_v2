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

    // Create a new department
    async createDepartment(department: Partial<Department>): Promise<Department> {
        const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.createDepartment}`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(department),
        });
        if (!response.ok) {
            throw new Error("Failed to create department");
        }
        return response.json();
    },

    async updateDepartment(id: string, department: Partial<Department>): Promise<Department> {
        const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.updateDepartment}`;
        const response = await fetch(`${url}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(department),
        });
        if (!response.ok) {
            throw new Error("Failed to update department");
        }
        return response.json();
    },

    async deleteDepartment(id: string): Promise<void> {
        const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.deleteDepartment}`;
        const response = await fetch(`${url}/${id}`, {
            method: "DELETE",
        });
        if (!response.ok) {
            throw new Error("Failed to delete department");
        }
    },
};
