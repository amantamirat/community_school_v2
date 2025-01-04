import { Curriculum } from "@/types/model";
import { API_CONFIG } from "./apiConfig";

const CACHE_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds
const storageName = 'curriculums';
const cacheTimeStampName = 'curriculumsCacheTimestamp'

export const CurriculumService = {
    async getCurriculums(): Promise<Curriculum[]> {

        const cachedData = localStorage.getItem(storageName);
        const cacheTimestamp = localStorage.getItem(cacheTimeStampName);
        const currentTime = Date.now();
        // If cached data exists and is still valid
        if (cachedData && cacheTimestamp && currentTime - parseInt(cacheTimestamp) < CACHE_EXPIRATION_TIME) {
            //console.log("Returning cached data from localStorage");
            return JSON.parse(cachedData) as Curriculum[];
        }

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

            localStorage.setItem(storageName, JSON.stringify(data));
            localStorage.setItem(cacheTimeStampName, currentTime.toString());

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

        // Update localStorage to include the newly created subject
        const cachedData = localStorage.getItem(storageName);
        if (cachedData) {
            const localData = JSON.parse(cachedData) as Curriculum[];
            localData.push(createdCurriculum);
            localStorage.setItem(storageName, JSON.stringify(localData));
        }
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

    async deleteCurriculum(id: string): Promise<boolean> {
        const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.deleteCurriculum}`;
        const response = await fetch(`${url}/${id}`, {
            method: "DELETE",
        });
        if (!response.ok) {
            throw new Error("Failed to delete curriculum");
        }
        const cachedData = localStorage.getItem(storageName);
        if (cachedData) {
            let localData = JSON.parse(cachedData) as Curriculum[];
            localData = localData.filter(data => data._id !== id);
            localStorage.setItem(storageName, JSON.stringify(localData));
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
