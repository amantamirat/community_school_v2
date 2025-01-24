import { AdmissionClassification, ClassificationGrade } from "@/types/model";
import { MyService } from "./MyService";
const CACHE_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds
const storageName = 'classificationGrades';
const cacheTimeStampName = 'classificationGradesCacheTimestamp'
const get_endpoint = '/api/classification-grades/admission_classification';
const sync_endpoint = '/api/classification-grades/sync-curriculum-grades';
const create_endpoint = '/api/classification-grades/create';
const delete_endpoint = '/api/classification-grades/delete';


function sanitize(class_grade: Partial<ClassificationGrade>) {
    return {
        ...class_grade,
        admission_classification: (class_grade.admission_classification && typeof class_grade.admission_classification !== 'string') ? class_grade.admission_classification._id : class_grade.admission_classification,
        curriculum_grade: (class_grade.curriculum_grade && typeof class_grade.curriculum_grade !== 'string') ? class_grade.curriculum_grade._id : class_grade.curriculum_grade
    };
}

export const ClassificationGradeService = {


    async getClassificationGradesByClassification(admission_classification: AdmissionClassification): Promise<ClassificationGrade[]> {
        const cachedData = localStorage.getItem(storageName);
        const cacheTimestamp = localStorage.getItem(cacheTimeStampName);
        const currentTime = Date.now();
        let localData: ClassificationGrade[] = cachedData ? JSON.parse(cachedData) : [];
        if (cachedData && cacheTimestamp && currentTime - parseInt(cacheTimestamp) < CACHE_EXPIRATION_TIME) {
            const cachedItems = localData.filter(item => item.admission_classification === admission_classification._id);
            if (cachedItems.length > 0) {
                return cachedItems;
            }
        }
        const endpoint = `${get_endpoint}/${admission_classification._id}`;
        const data = await MyService.get(endpoint);
        localStorage.setItem(storageName, JSON.stringify(data));
        localStorage.setItem(cacheTimeStampName, currentTime.toString());
        return data as ClassificationGrade[];

    },

   

    async syncCurriculumGrades(admission_classification: AdmissionClassification): Promise<ClassificationGrade[]> {
        const createdData = await MyService.create({}, `${sync_endpoint}/${admission_classification._id}`) as ClassificationGrade[];
        const cachedData = localStorage.getItem(storageName);
        if (cachedData) {
            const localData = JSON.parse(cachedData) as ClassificationGrade[];
            for (const data of createdData) {
                //localData.push(createdData);
                localData.push(data);
            }
            localStorage.setItem(storageName, JSON.stringify(localData));
        }
        return createdData;
    },

    async deleteClassificationGrade(classificationGrade: ClassificationGrade): Promise<boolean> {
        if (classificationGrade._id) {
            const response = await MyService.delete(classificationGrade._id, delete_endpoint);
            const cachedData = localStorage.getItem(storageName);
            if (cachedData) {
                let localData = JSON.parse(cachedData) as ClassificationGrade[];
                localData = localData.filter(data => data._id !== classificationGrade._id);
                localStorage.setItem(storageName, JSON.stringify(localData));
            }
            return response;
        }
        throw new Error("_id is required.");
    },
};
