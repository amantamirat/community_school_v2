import { AcademicSession, AdmissionClassification } from "@/types/model";
import { MyService } from "./MyService";

const CACHE_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds
const storageName = 'classifications';
const cacheTimeStampName = 'classificationsCacheTimestamp'
const get_endpoint = '/api/admission-classifications/academic_session';
const create_endpoint = '/api/admission-classifications/create';
const delete_endpoint = '/api/admission-classifications/delete';

function sanitize(admission: Partial<AdmissionClassification>) {
    return {
        ...admission,
        curriculum: (admission.curriculum && typeof admission.curriculum !== 'string') ? admission.curriculum._id : admission.curriculum,
        academic_session: (admission.academic_session && typeof admission.academic_session !== 'string') ? admission.academic_session._id : admission.academic_session
    };
}

export const AdmissionClassificationService = {
    async getAcademicSessionClassifications(academic_session: AcademicSession): Promise<AdmissionClassification[]> {
        const cachedData = localStorage.getItem(storageName);
        const cacheTimestamp = localStorage.getItem(cacheTimeStampName);
        const currentTime = Date.now();
        let localData: AdmissionClassification[] = cachedData ? JSON.parse(cachedData) : [];
        if (cachedData && cacheTimestamp && currentTime - parseInt(cacheTimestamp) < CACHE_EXPIRATION_TIME) {
            const cachedItems = localData.filter(item => item.academic_session === academic_session._id);
            if (cachedItems.length > 0) {
                return cachedItems;
            }
        }
        const endpoint = `${get_endpoint}/${academic_session._id}`;
        const data = await MyService.get(endpoint);
        localStorage.setItem(storageName, JSON.stringify(data));
        localStorage.setItem(cacheTimeStampName, currentTime.toString());
        return data as AdmissionClassification[];
    },

    // Create a new admissionClassification
    async createAdmissionClassification(admissionClassification: AdmissionClassification): Promise<AdmissionClassification> {
        const createdData = await MyService.create(admissionClassification, create_endpoint) as AdmissionClassification;
        const cachedData = localStorage.getItem(storageName);
        if (cachedData) {
            const localData = JSON.parse(cachedData) as AdmissionClassification[];
            localData.push({ ...admissionClassification, _id: createdData._id });//
            localStorage.setItem(storageName, JSON.stringify(localData));
        }
        return createdData;
    },



    async deleteAdmissionClassification(admissionClassification: AdmissionClassification): Promise<boolean> {
        if (admissionClassification._id) {
            const response = await MyService.delete(admissionClassification._id, delete_endpoint);
            const cachedData = localStorage.getItem(storageName);
            if (cachedData) {
                let localData = JSON.parse(cachedData) as AdmissionClassification[];
                localData = localData.filter(data => data._id !== admissionClassification._id);
                localStorage.setItem(storageName, JSON.stringify(localData));
            }
            return response;
        }
        throw new Error("_id is required.");
    },
};
