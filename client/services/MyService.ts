import { API_CONFIG } from "./apiConfig";
import { getSession } from "next-auth/react"; // Assuming you're using NextAuth for authentication

const getAuthHeader = async () => {
    const session = await getSession();
    if (session && session.user.accessToken) {
        return `Bearer ${session.user.accessToken}`;
    }
    return '';
}


export const MyService = {
    async get(endPoint: string): Promise<any> {
        const url = `${API_CONFIG.baseURL}${endPoint}`;
        try {
            const authHeader = await getAuthHeader();
            const response = await fetch(url, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Content-Type': 'application/json',
                    "Authorization": authHeader,
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
            throw error;
        }
    },


    async create(payload: any, endpoint: string): Promise<any> {
        const url = `${API_CONFIG.baseURL}${endpoint}`;
        const authHeader = await getAuthHeader();
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": authHeader,
            },
            body: JSON.stringify(payload),
        });
        //console.log(JSON.stringify(payload));
        if (!response.ok) {
            return response.json().then(data => {
                console.log(data);
                throw new Error(data.message || "Error created");
            });
        }
        const createdData = await response.json();
        return createdData;

    },

    async update(id: string, payload: any, endpoint: string): Promise<any> {
        const url = `${API_CONFIG.baseURL}${endpoint}`;
        const authHeader = await getAuthHeader();
        const response = await fetch(`${url}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": authHeader,
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

    async put(endpoint: string, payload: any): Promise<any> {
        const url = `${API_CONFIG.baseURL}${endpoint}`;
        const authHeader = await getAuthHeader();
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": authHeader,
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
        const authHeader = await getAuthHeader();
        const response = await fetch(`${url}/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": authHeader,
            },
        });
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.message || "Failed to delete");
            });
        }
        return response.status === 200;
    },
    async delete_payload(payload: any, endpoint: string): Promise<any> {
        const url = `${API_CONFIG.baseURL}${endpoint}`;
        const authHeader = await getAuthHeader();
        const response = await fetch(`${url}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": authHeader,
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.message || "Failed to delete");
            });
        }
        return response.json();
    },

    async uploadByPUT(endpoint: string, payload: FormData): Promise<any> {
        const url = `${API_CONFIG.baseURL}${endpoint}`;
        const authHeader = await getAuthHeader();
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Authorization": authHeader,
            },
            body: payload,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to update data");
        }

        return await response.json();
    },

    photoURL(endpoint: string): string {
        return `${API_CONFIG.baseURL}${endpoint}`;
    }


};
