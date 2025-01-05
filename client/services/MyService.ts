import { API_CONFIG } from "./apiConfig";

export const MyService = {
    async get(endPoint: string): Promise<any[]> {
        const url = `${API_CONFIG.baseURL}${endPoint}`;
        console.log(url);
        try {
            const response = await fetch(url, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || "Failed to get data");
                });
            }
            const data = await response.json();
            return data;
        } catch (error) {
            //console.error('Error fetching data:', error);
            throw error;
        }
    },


    async create(payload: Partial<any>, endpoint: string): Promise<any> {
        const url = `${API_CONFIG.baseURL}${endpoint}`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.message || "Failed to create data");
            });
        }
        const createdData = await response.json();
        return createdData;

    },

    async update(id: string, payload: Partial<any>, endpoint: string): Promise<any> {
        const url = `${API_CONFIG.baseURL}${endpoint}`;
        const response = await fetch(`${url}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.message || "Failed to update data");
            });
        }
        const updatedData = await response.json();
        return updatedData;
    },

    async delete(id: string, endpoint: string): Promise<boolean> {
        const url = `${API_CONFIG.baseURL}${endpoint}`;
        const response = await fetch(`${url}/${id}`, {
            method: "DELETE",
        });
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.message || "Failed to delete");
            });
        }
        return response.status === 200;
    },
};
