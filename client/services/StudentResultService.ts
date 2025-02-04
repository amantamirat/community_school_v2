import { SectionClass, StudentClass, StudentResult } from "@/types/model";
import { MyService } from "./MyService";
const CACHE_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds
const storageName = 'studentResults';
const cacheTimeStampName = 'studentResultsCacheTimestamp'
const get_endpoint_by_student_class = '/api/student-results/student_class';
const get_endpoint_by_section_class = '/api/student-results/section_class';
const submit_endpoint = '/api/student-results/submit';
const activate_endpoint = '/api/student-results/activate';
const delete_endpoint = '/api/student-results/delete';
const update_student_results_endpoint = '/api/student-results/update-student-results';



export const StudentResultService = {

    async getStudentResultsBySectionClass(section_class: SectionClass): Promise<StudentResult[]> {
        const endpoint = `${get_endpoint_by_section_class}/${section_class._id}`;
        const data = await MyService.get(endpoint);
        return data as StudentResult[];
    },

    async getStudentResultsByStudentClass(student_class: StudentClass): Promise<StudentResult[]> {
        const endpoint = `${get_endpoint_by_student_class}/${student_class._id}`;
        const data = await MyService.get(endpoint);
        return data as StudentResult[];
    },

    async updateStudentResults(results: StudentResult[]): Promise<any> {
        const data = await MyService.put(update_student_results_endpoint, results);
        return data as StudentResult[];
    },

    async submitStudentResults(section_class: SectionClass): Promise<any> {
        const data = await MyService.put(`${submit_endpoint}/${section_class._id}`, {});
        return data;
    },

    async activateStudentResults(section_class: SectionClass): Promise<any> {
        const data = await MyService.put(`${activate_endpoint}/${section_class._id}`, {});
        return data;
    },

    async deleteStudentResult(studentResult: StudentResult): Promise<boolean> {
        if (studentResult._id) {
            const response = await MyService.delete(studentResult._id, delete_endpoint);
            return response;
        }
        throw new Error("_id is required.");
    },
};
