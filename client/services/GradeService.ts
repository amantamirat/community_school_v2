import { Grade } from "@/types/model";
import { API_CONFIG } from "./apiConfig";

const CACHE_EXPIRATION_TIME = 60 * 60 * 1000; // 60 minutes in milliseconds
const storageName = 'grades';
const cacheTimeStampName = 'gradesCacheTimestamp'

export const GradeService = {
    async getGrades(): Promise<Grade[]> {

        const cachedData = localStorage.getItem(storageName);
        const cacheTimestamp = localStorage.getItem(cacheTimeStampName);
        const currentTime = Date.now();
        // If cached data exists and is still valid
        if (cachedData && cacheTimestamp && currentTime - parseInt(cacheTimestamp) < CACHE_EXPIRATION_TIME) {
            //console.log("Returning cached data from localStorage");
            return JSON.parse(cachedData) as Grade[];
        }

        const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.getGrades}`;
        try {
            const response = await fetch(url, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch grades: ${response.statusText}`);
            }
            const data = await response.json();
            localStorage.setItem(storageName, JSON.stringify(data));
            localStorage.setItem(cacheTimeStampName, currentTime.toString());
            return data as Grade[];
        } catch (error) {
            console.error('Error fetching grade data:', error);
            throw error;
        }
    },
}