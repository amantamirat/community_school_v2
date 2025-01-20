import { GradeSubject } from "@/types/model";
import { API_CONFIG } from "./apiConfig";
import { MyService } from "./MyService";

const CACHE_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds
const storageName = 'gradeSubjects';
const cacheTimeStampName = 'gradeSubjectsCacheTimestamp'
const update_endpoint = '/api/grade-subject/update';

export const GradeSubjectService = {

    async getGradeSubjectsByCurriculumGrade(curriculum_grade: string): Promise<GradeSubject[]> {
        const cachedData = localStorage.getItem(storageName);
        const cacheTimestamp = localStorage.getItem(cacheTimeStampName);
        const currentTime = Date.now();
        let localData: GradeSubject[] = cachedData ? JSON.parse(cachedData) : [];

        if (cachedData && cacheTimestamp && currentTime - parseInt(cacheTimestamp) < CACHE_EXPIRATION_TIME) {
            const cachedItems = localData.filter(item => item.curriculum_grade === curriculum_grade);
            if (cachedItems.length > 0) {
                return cachedItems;
            }
        }
        const endpoint = `${API_CONFIG.endpoints.getGradeSubjectsByCurriculumGrade}/${curriculum_grade}`;
        const data = await MyService.get(endpoint);
        localStorage.setItem(storageName, JSON.stringify(data));
        localStorage.setItem(cacheTimeStampName, currentTime.toString());
        return data as GradeSubject[];

    },
    async createGradeSubject(gradeSubject: Partial<GradeSubject>): Promise<GradeSubject> {
        const endpoint = `${API_CONFIG.endpoints.createGradeSubject}`;
        const createdData = await MyService.create(gradeSubject, endpoint);
        const cachedData = localStorage.getItem(storageName);
        if (cachedData) {
            const localData = JSON.parse(cachedData) as GradeSubject[];
            localData.push(createdData);
            localStorage.setItem(storageName, JSON.stringify(localData));
        }
        return createdData;
    },

    async updateGradeSubject(gradeSubject: GradeSubject): Promise<GradeSubject> {
        if (gradeSubject._id) {
            const updatedGradeSubject = await MyService.update(gradeSubject._id, gradeSubject, update_endpoint);
            return updatedGradeSubject;
        }
        throw new Error('I told you, grade subject is required');
    },

    async deleteGradeSubject(id: string): Promise<boolean> {
        const endpoint = `${API_CONFIG.endpoints.deleteGradeSubject}`;
        const response = await MyService.delete(id, endpoint);
        const cachedData = localStorage.getItem(storageName);
        if (cachedData) {
            let localData = JSON.parse(cachedData) as GradeSubject[];
            localData = localData.filter(data => data._id !== id);
            localStorage.setItem(storageName, JSON.stringify(localData));
        }
        return response;
    },
};
