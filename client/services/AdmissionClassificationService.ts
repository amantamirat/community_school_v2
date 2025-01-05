import { AdmissionClassification } from "@/types/model";
import { API_CONFIG } from "./apiConfig";

const CACHE_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds
const storageName = 'classifications';
const cacheTimeStampName = 'classificationsCacheTimestamp'

export const AdmissionClassificationService = {

    /*
    async getAdmissionClassifications(): Promise<AdmissionClassification[]> {
        const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.getAdmissionClassifications}`;
        try {
            const response = await fetch(url, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || "Failed to fetch admissionClassifications");
                });
            }
            const data = await response.json();
            return data as AdmissionClassification[];
        } catch (error) {
            console.error('Error fetching admissionClassification data:', error);
            throw error;
        }
    },
    
    */


    async getAcademicSessionClassifications(academic_session_id: string): Promise<AdmissionClassification[]> {

        const cachedData = localStorage.getItem(storageName);
        const cacheTimestamp = localStorage.getItem(cacheTimeStampName);
        const currentTime = Date.now();
        let localData: AdmissionClassification[] = cachedData ? JSON.parse(cachedData) : [];
    
        if (cachedData && cacheTimestamp && currentTime - parseInt(cacheTimestamp) < CACHE_EXPIRATION_TIME) {
            const cachedItems = localData.filter(item => item.academic_session === academic_session_id);
            if (cachedItems.length > 0) {
                return cachedItems;
            }
        } 
        const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.getAcademicSessionClassifications}`;
        console.log(`${url}/${academic_session_id}`);
        try {
            const response = await fetch(`${url}/${academic_session_id}`, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || "Failed to fetch admissionClassifications");
                });
            }
            const data = await response.json();
            localStorage.setItem(storageName, JSON.stringify(data));
            localStorage.setItem(cacheTimeStampName, currentTime.toString());

            return data as AdmissionClassification[];
        } catch (error) {
            console.error('Error fetching Admission Classification data:', error);
            throw error;
        }
    },

    // Create a new admissionClassification
    async createAdmissionClassification(admissionClassification: Partial<AdmissionClassification>): Promise<AdmissionClassification> {
        const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.createAdmissionClassification}`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(admissionClassification),
        });
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.message || "Failed to create admissionClassification");
            });
        }
        const createdData = await response.json();
        // Update localStorage to include the newly created subject
        const cachedData = localStorage.getItem(storageName);
        if (cachedData) {
            const localData = JSON.parse(cachedData) as AdmissionClassification[];
            localData.push(createdData);
            localStorage.setItem(storageName, JSON.stringify(localData));
        }
        return createdData;

    },

    async updateAdmissionClassification(id: string, admissionClassification: Partial<AdmissionClassification>): Promise<AdmissionClassification> {
        const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.updateAdmissionClassification}`;
        const response = await fetch(`${url}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(admissionClassification),
        });
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.message || "Failed to update admissionClassification");
            });
        }
        const updatedData = await response.json();
        // Update localStorage to reflect the changes
        const cachedData = localStorage.getItem(storageName);
        if (cachedData) {
            let localData = JSON.parse(cachedData) as AdmissionClassification[];
            localData = localData.map(data =>
                data._id === updatedData._id ? updatedData : data
            );
            localStorage.setItem(storageName, JSON.stringify(localData));
        }
        return updatedData;
    },

    async deleteAdmissionClassification(id: string): Promise<boolean> {
        const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.deleteAdmissionClassification}`;
        const response = await fetch(`${url}/${id}`, {
            method: "DELETE",
        });
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.message || "Failed to delete admissionClassification");
            });
        }
        const cachedData = localStorage.getItem(storageName);
        if (cachedData) {
            let localData = JSON.parse(cachedData) as AdmissionClassification[];
            localData = localData.filter(data => data._id !== id);
            localStorage.setItem(storageName, JSON.stringify(localData));
        }
        return response.status === 200;
    },
};
