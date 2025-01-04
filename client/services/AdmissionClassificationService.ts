import { AdmissionClassification } from "@/types/model";
import { API_CONFIG } from "./apiConfig";

export const AdmissionClassificationService = {
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
        const createdAdmissionClassification = await response.json();
        return createdAdmissionClassification;

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
        const updatedAdmissionClassification = await response.json();
        return updatedAdmissionClassification;
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
        return response.status === 200;
    },
};
