import { ClassificationGrade } from "@/types/model";
import { API_CONFIG } from "./apiConfig";
import { MyService } from "./MyService";

const CACHE_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds
const storageName = 'classificationGrades';
const cacheTimeStampName = 'classificationGradesCacheTimestamp'

function sanitize(class_grade: Partial<ClassificationGrade>) {
    return {
        ...class_grade,
        admission_classification: (class_grade.admission_classification && typeof class_grade.admission_classification !== 'string') ? class_grade.admission_classification._id : class_grade.admission_classification,
        curriculum_grade: (class_grade.curriculum_grade && typeof class_grade.curriculum_grade !== 'string') ? class_grade.curriculum_grade._id : class_grade.curriculum_grade
    };
}

export const ClassificationGradeService = {


    async getClassificationGradesByClassification(admission_classification: string): Promise<ClassificationGrade[]> {
        const cachedData = localStorage.getItem(storageName);
        const cacheTimestamp = localStorage.getItem(cacheTimeStampName);
        const currentTime = Date.now();
        let localData: ClassificationGrade[] = cachedData ? JSON.parse(cachedData) : [];
        if (cachedData && cacheTimestamp && currentTime - parseInt(cacheTimestamp) < CACHE_EXPIRATION_TIME) {
            const cachedItems = localData.filter(item => item.admission_classification === admission_classification);
            if (cachedItems.length > 0) {
                return cachedItems;
            }
        }
        const endpoint = `${API_CONFIG.endpoints.getClassificationGradesByClassification}/${admission_classification}`;
        const data = await MyService.get(endpoint);
        localStorage.setItem(storageName, JSON.stringify(data));
        localStorage.setItem(cacheTimeStampName, currentTime.toString());
        return data as ClassificationGrade[];

    },
    async createClassificationGrade(classificationGrade: Partial<ClassificationGrade>): Promise<ClassificationGrade> {
        const endpoint = `${API_CONFIG.endpoints.createClassificationGrade}`;
        //console.log(sanitize(classificationGrade));
        const createdData = await MyService.create(sanitize(classificationGrade), endpoint);
        const cachedData = localStorage.getItem(storageName);
        if (cachedData) {
            const localData = JSON.parse(cachedData) as ClassificationGrade[];
            localData.push(createdData);
            localStorage.setItem(storageName, JSON.stringify(localData));
        }
        return createdData;
    },

    async deleteClassificationGrade(id: string): Promise<boolean> {
        const endpoint = `${API_CONFIG.endpoints.deleteClassificationGrade}`;
        const response = await MyService.delete(id, endpoint);
        const cachedData = localStorage.getItem(storageName);
        if (cachedData) {
            let localData = JSON.parse(cachedData) as ClassificationGrade[];
            localData = localData.filter(data => data._id !== id);
            localStorage.setItem(storageName, JSON.stringify(localData));
        }
        return response;
    },
};
