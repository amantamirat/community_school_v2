import { Subject } from "@/types/model";
import { API_CONFIG } from "./apiConfig";

const CACHE_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds
const storageName = 'subjects';
const cacheTimeStampName = 'subjectsCacheTimestamp'

export const SubjectService = {
    async getSubjects(): Promise<Subject[]> {

        const cachedData = localStorage.getItem(storageName);
        const cacheTimestamp = localStorage.getItem(cacheTimeStampName);
        const currentTime = Date.now();
        // If cached data exists and is still valid
        if (cachedData && cacheTimestamp && currentTime - parseInt(cacheTimestamp) < CACHE_EXPIRATION_TIME) {
            //console.log("Returning cached data from localStorage");
            return JSON.parse(cachedData) as Subject[];
        }

        const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.getSubjects}`;
        try {
            const response = await fetch(url, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || 'Failed to fetch subjects');
                });
            }
            const data = await response.json();
            localStorage.setItem(storageName, JSON.stringify(data));
            localStorage.setItem(cacheTimeStampName, currentTime.toString());
            return data as Subject[];
        } catch (error) {
            console.error('Error fetching subject data:', error);
            throw error;
        }
    },


    async createSubject(subject: Partial<Subject>): Promise<Subject> {
        const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.createSubject}`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(subject),
        });
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.message || "Failed to create subject");
            });
        }
        const createdSubject = await response.json();
        // Update localStorage to include the newly created subject
        const cachedData = localStorage.getItem(storageName);
        if (cachedData) {
            const subjects = JSON.parse(cachedData) as Subject[];
            subjects.push(createdSubject);
            localStorage.setItem(storageName, JSON.stringify(subjects));
        }
        return createdSubject;
    },

    async updateSubject(id: string, subject: Partial<Subject>): Promise<Subject> {
        const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.updateSubject}`;
        const response = await fetch(`${url}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(subject),
        });
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.message || "Failed to update subject");
            });
        }
        const updatedData = await response.json();
        // Update localStorage to reflect the changes
        const cachedData = localStorage.getItem(storageName);
        if (cachedData) {
            let subjects = JSON.parse(cachedData) as Subject[];
            subjects = subjects.map(subject =>
                subject._id === updatedData._id ? updatedData : subject
            );
            localStorage.setItem(storageName, JSON.stringify(subjects));
        }
        return updatedData;
    },

    async deleteSubject(id: string): Promise<boolean> {
        const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.deleteSubject}`;
        const response = await fetch(`${url}/${id}`, {
            method: "DELETE",
        });
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.message || "Failed to delete subject");
            });
        }

        const cachedData = localStorage.getItem(storageName);
        if (cachedData) {
            let subjects = JSON.parse(cachedData) as Subject[];
            subjects = subjects.filter(subject => subject._id !== id);
            localStorage.setItem(storageName, JSON.stringify(subjects));
        }
        return response.status === 200;
    },
};
