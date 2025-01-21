import { Curriculum } from "@/types/model";
import { API_CONFIG } from "./apiConfig";
import { MyService } from "./MyService";

const CACHE_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds
const storageName = 'curriculums';
const cacheTimeStampName = 'curriculumsCacheTimestamp'
const get_endpoint = '/api/curricula/';
const create_endpoint = '/api/curricula/create';
const update_endpoint = '/api/curricula/update';
const delete_endpoint = '/api/curricula/delete';

export const CurriculumService = {

    async getCurriculums(): Promise<Curriculum[]> {
        const cachedData = localStorage.getItem(storageName);
        const cacheTimestamp = localStorage.getItem(cacheTimeStampName);
        const currentTime = Date.now();
        if (cachedData && cacheTimestamp && currentTime - parseInt(cacheTimestamp) < CACHE_EXPIRATION_TIME) {
            return JSON.parse(cachedData) as Curriculum[];
        }
        const data = await MyService.get(get_endpoint);
        localStorage.setItem(storageName, JSON.stringify(data));
        localStorage.setItem(cacheTimeStampName, currentTime.toString());
        return data as Curriculum[];
    },

    // Create a new curriculum
    async createCurriculum(curriculum: Curriculum): Promise<Curriculum> {
        const createdData = await MyService.create(curriculum, create_endpoint);
        const cachedData = localStorage.getItem(storageName);
        if (cachedData) {
            const curriculums = JSON.parse(cachedData) as Curriculum[];
            curriculums.push(createdData);
            localStorage.setItem(storageName, JSON.stringify(curriculums));
        }
        return createdData;

    },

    // Update curriculum
    async updateCurriculum(curriculum: Curriculum): Promise<Curriculum> {
        if (curriculum._id) {
            const updatedData = await MyService.update(curriculum._id, curriculum, update_endpoint);
            const cachedData = localStorage.getItem('curriculums');
            if (cachedData) {
                let curriculums = JSON.parse(cachedData) as Curriculum[];
                curriculums = curriculums.map(curriculum =>
                    curriculum._id === updatedData._id ? updatedData : curriculum
                );
                localStorage.setItem(storageName, JSON.stringify(curriculums));// Save the updated list back to localStorage
            }
            return updatedData;
        }
        throw new Error("_id is required.");
    },

    async deleteCurriculum(curriculum: Curriculum): Promise<boolean> {
        if (curriculum._id) {
            const response = await MyService.delete(curriculum._id, delete_endpoint);
            const cachedData = localStorage.getItem(storageName);
            if (cachedData) {
                let curriculums = JSON.parse(cachedData) as Curriculum[];
                curriculums = curriculums.filter(dept => dept._id !== curriculum._id);
                localStorage.setItem(storageName, JSON.stringify(curriculums));
            }
            return response;
        }
        throw new Error("_id is required.");
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
        const updatedData = await response.json();
        // Update localStorage to reflect the changes
        const cachedData = localStorage.getItem(storageName);
        if (cachedData) {
            let localData = JSON.parse(cachedData) as Curriculum[];
            localData = localData.map(data =>
                data._id === updatedData._id ? updatedData : data
            );
            localStorage.setItem(storageName, JSON.stringify(localData));
        }
        return updatedData;
    },

    async removeGrade(curriculumId: string, curriclumGradeId: string): Promise<Curriculum> {
        const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.removeGrade}`;
        const response = await fetch(`${url}/${curriculumId}/${curriclumGradeId}`, {
            method: "DELETE"
        });
        if (!response.ok) {
            throw new Error("Failed to remove curriculum grade");
        }
        const updatedData = await response.json();
        // Update localStorage to reflect the changes
        const cachedData = localStorage.getItem(storageName);
        if (cachedData) {
            let localData = JSON.parse(cachedData) as Curriculum[];
            localData = localData.map(data =>
                data._id === updatedData._id ? updatedData : data
            );
            localStorage.setItem(storageName, JSON.stringify(localData));
        }
        return updatedData;
    },

    async addSubject(curriculumId: string, gradeId: string, subject: string): Promise<Curriculum> {
        const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.addSubject}`;
        const response = await fetch(`${url}/${curriculumId}/${gradeId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ subject }),
        });
        if (!response.ok) {
            throw new Error("Failed to add grade");
        }
        const updatedData = await response.json();
        // Update localStorage to reflect the changes
        const cachedData = localStorage.getItem(storageName);
        if (cachedData) {
            let localData = JSON.parse(cachedData) as Curriculum[];
            localData = localData.map(data =>
                data._id === updatedData._id ? updatedData : data
            );
            localStorage.setItem(storageName, JSON.stringify(localData));
        }
        return updatedData;
    },

    async removeSubject(curriculumId: string, curriclumGradeId: string, gradeSubjectId: string): Promise<Curriculum> {
        const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.removeSubject}`;
        const response = await fetch(`${url}/${curriculumId}/${curriclumGradeId}/${gradeSubjectId}`, {
            method: "DELETE"
        });
        if (!response.ok) {
            throw new Error("Failed to remove curriculum grade");
        }
        const updatedData = await response.json();
        // Update localStorage to reflect the changes
        const cachedData = localStorage.getItem(storageName);
        if (cachedData) {
            let localData = JSON.parse(cachedData) as Curriculum[];
            localData = localData.map(data =>
                data._id === updatedData._id ? updatedData : data
            );
            localStorage.setItem(storageName, JSON.stringify(localData));
        }
        return updatedData;
    },

};
