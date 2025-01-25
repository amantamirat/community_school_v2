import { SectionClass, StudentClass, StudentGrade } from "@/types/model";
import { MyService } from "./MyService";
const CACHE_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds
const storageName = 'studentClasss';
const cacheTimeStampName = 'studentClasssCacheTimestamp'
const get_endpoint_by_student_grade = '/api/student-classes/student_grade';
const get_endpoint_by_section_class = '/api/student-classes/section_class';
const sync_endpoint = '/api/student-classes/sync-student-class';
const delete_endpoint = '/api/student-classes/delete';



export const StudentClassService = {

    async getStudentClasss(student_grade: StudentGrade): Promise<StudentClass[]> {
        const endpoint = `${get_endpoint_by_student_grade}/${student_grade._id}`;
        const data = await MyService.get(endpoint);
        return data as StudentClass[];
    },

    async getStudentClasssBySectionClass(section_class: SectionClass): Promise<StudentClass[]> {
        const endpoint = `${get_endpoint_by_section_class}/${section_class._id}`;
        const data = await MyService.get(endpoint);
        return data as StudentClass[];
    },

    async syncStudentClasses(student_grade: StudentGrade): Promise<StudentClass[]> {
        const createdData = await MyService.create({}, `${sync_endpoint}/${student_grade._id}`) as StudentClass[];
        return createdData;
    },

    async deleteStudentClass(studentClass: StudentClass): Promise<boolean> {
        if (studentClass._id) {
            const response = await MyService.delete(studentClass._id, delete_endpoint);
            return response;
        }
        throw new Error("_id is required.");
    },
};
