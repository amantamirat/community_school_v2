import { CurriculumGrade } from "@/types/model";
import { API_CONFIG } from "./apiConfig";
import { MyService } from "./MyService";

const CACHE_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds
const storageName = 'curriculumGrades';
const cacheTimeStampName = 'curriculumGradesCacheTimestamp'

export const CurriculumGradeService = {


    async getCurriculumGradesByCurriculum(curriculum: string): Promise<CurriculumGrade[]> {
        const cachedData = localStorage.getItem(storageName);
        const cacheTimestamp = localStorage.getItem(cacheTimeStampName);
        const currentTime = Date.now();
        let localData: CurriculumGrade[] = cachedData ? JSON.parse(cachedData) : [];
        if (cachedData && cacheTimestamp && currentTime - parseInt(cacheTimestamp) < CACHE_EXPIRATION_TIME) {
            const cachedItems = localData.filter(item => item.curriculum === curriculum);
            if (cachedItems.length > 0) {
                return cachedItems;
            }
        }
        const endpoint = `${API_CONFIG.endpoints.getCurriculumGradesByCurriculum}/${curriculum}`;
        const data = await MyService.get(endpoint);
        localStorage.setItem(storageName, JSON.stringify(data));
        localStorage.setItem(cacheTimeStampName, currentTime.toString());
        return data as CurriculumGrade[];

    },
    async createCurriculumGrade(curriculumGrade: Partial<CurriculumGrade>): Promise<CurriculumGrade> {
        const endpoint = `${API_CONFIG.endpoints.createCurriculumGrade}`;
        const createdData = await MyService.create(curriculumGrade, endpoint);
        const cachedData = localStorage.getItem(storageName);
        if (cachedData) {
            const localData = JSON.parse(cachedData) as CurriculumGrade[];
            localData.push(createdData);
            localStorage.setItem(storageName, JSON.stringify(localData));
        }
        return createdData;
    },

    async deleteCurriculumGrade(id: string): Promise<boolean> {
        const endpoint = `${API_CONFIG.endpoints.deleteCurriculumGrade}`;
        const response = await MyService.delete(id, endpoint);
        const cachedData = localStorage.getItem(storageName);
        if (cachedData) {
            let localData = JSON.parse(cachedData) as CurriculumGrade[];
            localData = localData.filter(data => data._id !== id);
            localStorage.setItem(storageName, JSON.stringify(localData));
        }
        return response;
    },
};
