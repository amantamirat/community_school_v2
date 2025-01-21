import { Subject } from "@/types/model";
import { MyService } from "./MyService";

const CACHE_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds
const storageName = 'subjects';
const cacheTimeStampName = 'subjectsCacheTimestamp'
const get_endpoint = '/api/subjects/';
const create_endpoint = '/api/subjects/create';
const update_endpoint = '/api/subjects/update';
const delete_endpoint = '/api/subjects/delete';

export const SubjectService = {

    async getSubjects(): Promise<Subject[]> {
        const cachedData = localStorage.getItem(storageName);
        const cacheTimestamp = localStorage.getItem(cacheTimeStampName);
        const currentTime = Date.now();
        if (cachedData && cacheTimestamp && currentTime - parseInt(cacheTimestamp) < CACHE_EXPIRATION_TIME) {
            return JSON.parse(cachedData) as Subject[];
        }
        const data = await MyService.get(get_endpoint);
        localStorage.setItem(storageName, JSON.stringify(data));
        localStorage.setItem(cacheTimeStampName, currentTime.toString());
        return data as Subject[];
    },


    // Create a new subject
    async createSubject(subject: Subject): Promise<Subject> {
        const createdData = await MyService.create(subject, create_endpoint);
        const cachedData = localStorage.getItem(storageName);
        if (cachedData) {
            const subjects = JSON.parse(cachedData) as Subject[];
            subjects.push(createdData);
            localStorage.setItem(storageName, JSON.stringify(subjects));
        }
        return createdData;

    },

    // Update subject
    async updateSubject(subject: Subject): Promise<Subject> {
        if (subject._id) {
            const updatedData = await MyService.update(subject._id, subject, update_endpoint);
            const cachedData = localStorage.getItem('subjects');
            if (cachedData) {
                let subjects = JSON.parse(cachedData) as Subject[];
                subjects = subjects.map(subject =>
                    subject._id === updatedData._id ? updatedData : subject
                );
                localStorage.setItem(storageName, JSON.stringify(subjects));
            }
            return updatedData;
        }
        throw new Error("_id is required.");
    },

    async deleteSubject(subject: Subject): Promise<boolean> {
        if (subject._id) {
            const response = await MyService.delete(subject._id, delete_endpoint);
            const cachedData = localStorage.getItem(storageName);
            if (cachedData) {
                let subjects = JSON.parse(cachedData) as Subject[];
                subjects = subjects.filter(dept => dept._id !== subject._id);
                localStorage.setItem(storageName, JSON.stringify(subjects));
            }
            return response;
        }
        throw new Error("_id is required.");
    },
};
