import { StudentResult, StudentGrade, SectionClass } from "@/types/model";
import { MyService } from "./MyService";
const CACHE_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds
const storageName = 'studentResults';
const cacheTimeStampName = 'studentResultsCacheTimestamp'
const get_endpoint_by_student_grade = '/api/student-results/student_grade';
const get_endpoint_by_section_class = '/api/student-results/section_class';
const delete_endpoint = '/api/student-results/delete';



export const StudentResultService = {

    async getStudentResultsBySectionClass(term: number, section_class: SectionClass): Promise<StudentResult[]> {
        const endpoint = `${get_endpoint_by_section_class}/${term}/${section_class._id}`;
        const data = await MyService.get(endpoint);
        return data as StudentResult[];
    },

    async deleteStudentResult(studentResult: StudentResult): Promise<boolean> {
        if (studentResult._id) {
            const response = await MyService.delete(studentResult._id, delete_endpoint);
            return response;
        }
        throw new Error("_id is required.");
    },
};
