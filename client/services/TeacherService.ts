import { Teacher } from "@/types/model";
import { API_CONFIG } from "./apiConfig";

export const TeacherService = {
    async getTeachers(): Promise<Teacher[]> {
        const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.getTeachers}`;
        try {
            const response = await fetch(url, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch teachers: ${response.statusText}`);
            }
            const data = await response.json();
            return data as Teacher[];
        } catch (error) {
            console.error('Error fetching teacher data:', error);
            throw error;
        }
    },

    // Create a new teacher
    async createTeacher(teacher: Partial<Teacher>): Promise<Teacher> {
        const departmentObject = typeof teacher.department === "object" ? teacher.department : null;
        const teacherPayload = {
            ...teacher,
            department: departmentObject?._id || teacher.department,
        };
        const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.createTeacher}`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(teacherPayload),
        });
        if (!response.ok) {
            throw new Error("Failed to create teacher");
        }
        const createdTeacher = await response.json();
        if (departmentObject) {
            createdTeacher.department = departmentObject;
        }
        return createdTeacher;

    },

    async updateTeacher(id: string, teacher: Partial<Teacher>): Promise<Teacher> {
        const departmentObject = typeof teacher.department === "object" ? teacher.department : null;
        const teacherPayload = {
            ...teacher,
            department: departmentObject?._id || teacher.department,
        };
        const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.updateTeacher}`;
        const response = await fetch(`${url}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(teacherPayload),
        });
        if (!response.ok) {
            throw new Error("Failed to update teacher");
        }
        const updatedTeacher = await response.json();
        if (departmentObject) {
            updatedTeacher.department = departmentObject;
        }
        return updatedTeacher;
    },

    async deleteTeacher(id: string): Promise<boolean> {
        const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.deleteTeacher}`;
        const response = await fetch(`${url}/${id}`, {
            method: "DELETE",
        });
        if (!response.ok) {
            throw new Error("Failed to delete teacher");
        }
        return response.status === 200;
    },
};
