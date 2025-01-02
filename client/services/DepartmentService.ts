import { Department } from "@/types/model";
import { API_CONFIG } from "./apiConfig";

const CACHE_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds
const storageName = 'departments';
const cacheTimeStampName = 'departmentsCacheTimestamp'

export const DepartmentService = {
    async getDepartments(): Promise<Department[]> {

        const cachedData = localStorage.getItem(storageName);
        const cacheTimestamp = localStorage.getItem(cacheTimeStampName);
        const currentTime = Date.now();

        // If cached data exists and is still valid
        if (cachedData && cacheTimestamp && currentTime - parseInt(cacheTimestamp) < CACHE_EXPIRATION_TIME) {
            console.log("Returning cached data from localStorage");
            return JSON.parse(cachedData) as Department[];
        }

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
            localStorage.setItem(storageName, JSON.stringify(data));
            localStorage.setItem(cacheTimeStampName, currentTime.toString());
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
        const createdDepartment = await response.json();

        // Update localStorage to include the newly created department
        const cachedData = localStorage.getItem(storageName);
        if (cachedData) {
            const departments = JSON.parse(cachedData) as Department[];
            departments.push(createdDepartment);  // Add the new department to the cached list
            localStorage.setItem(storageName, JSON.stringify(departments));  // Save the updated list back to localStorage
        }

        return createdDepartment;
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
        const updatedData = await response.json();

        // Update localStorage to reflect the changes
        const cachedData = localStorage.getItem('departments');
        if (cachedData) {
            let departments = JSON.parse(cachedData) as Department[];
            // Find the department by ID and update it
            departments = departments.map(department =>
                department._id === updatedData._id ? updatedData : department
            );
            // Save the updated list back to localStorage
            localStorage.setItem(storageName, JSON.stringify(departments));
        }
        return updatedData;
    },

    async deleteDepartment(id: string): Promise<boolean> {
        const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.deleteDepartment}`;
        const response = await fetch(`${url}/${id}`, {
            method: "DELETE",
        });
        if (!response.ok) {
            throw new Error("Failed to delete department");
        }

        const cachedData = localStorage.getItem(storageName);
        if (cachedData) {
            let departments = JSON.parse(cachedData) as Department[];
            // Filter out the deleted department by ID
            departments = departments.filter(department => department._id !== id);
            // Update the localStorage with the new list of departments
            localStorage.setItem(storageName, JSON.stringify(departments));
        }
        return response.status === 200;
    },
};
