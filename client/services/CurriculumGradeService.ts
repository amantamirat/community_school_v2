import { Curriculum, CurriculumGrade } from "@/types/model";
import { MyService } from "./MyService";

const CACHE_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds
const storageName = 'curriculumGrades';
const cacheTimeStampName = 'curriculumGradesCacheTimestamp'
const get_endpoint = '/api/curriculum-grade/curriculum';
const create_endpoint = '/api/curriculum-grade/create';
const delete_endpoint = '/api/curriculum-grade/delete';

export const CurriculumGradeService = {

    async getCurriculumGradesByCurriculum(curriculum: Curriculum): Promise<CurriculumGrade[]> {
        const cachedData = localStorage.getItem(storageName);
        const cacheTimestamp = localStorage.getItem(cacheTimeStampName);
        const currentTime = Date.now();
        let localData: CurriculumGrade[] = cachedData ? JSON.parse(cachedData) : [];
        if (cachedData && cacheTimestamp && currentTime - parseInt(cacheTimestamp) < CACHE_EXPIRATION_TIME) {
            const cachedItems = localData.filter(item => item.curriculum === curriculum._id);
            if (cachedItems.length > 0) {
                return cachedItems;
            }
        }
        const endpoint = `${get_endpoint}/${curriculum._id}`;
        const data = await MyService.get(endpoint);
        localStorage.setItem(storageName, JSON.stringify(data));
        localStorage.setItem(cacheTimeStampName, currentTime.toString());
        return data as CurriculumGrade[];

    },
    async createCurriculumGrade(curriculumGrade: Partial<CurriculumGrade>): Promise<CurriculumGrade> {
        const createdData = await MyService.create(curriculumGrade, create_endpoint);
        const cachedData = localStorage.getItem(storageName);
        if (cachedData) {
            const localData = JSON.parse(cachedData) as CurriculumGrade[];
            localData.push(createdData);
            localStorage.setItem(storageName, JSON.stringify(localData));
        }
        return createdData;
    },

    async deleteCurriculumGrade(curriculumGrade: CurriculumGrade): Promise<boolean> {
        if (curriculumGrade._id) {
            const response = await MyService.delete(curriculumGrade._id, delete_endpoint);
            const cachedData = localStorage.getItem(storageName);
            if (cachedData) {
                let localData = JSON.parse(cachedData) as CurriculumGrade[];
                localData = localData.filter(data => data._id !== curriculumGrade._id);
                localStorage.setItem(storageName, JSON.stringify(localData));
            }
            return response;
        }
        throw new Error("_id is required.");
    },
};
