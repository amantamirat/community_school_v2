import { StudentClass, StudentGrade, TermClass } from "@/types/model";
import { MyService } from "./MyService";
const CACHE_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds
const storageName = 'studentClasss';
const cacheTimeStampName = 'studentClasssCacheTimestamp'
const get_endpoint_by_student_grade = '/api/student-classes/student_grade';
const get_endpoint_by_section_class = '/api/student-classes/term_class';
//const delete_endpoint = '/api/student-classes/delete';



export const StudentClassService = {

    async getStudentClasss(student_grade: StudentGrade): Promise<StudentClass[]> {
        const endpoint = `${get_endpoint_by_student_grade}/${student_grade._id}`;
        const data = await MyService.get(endpoint);
        return data as StudentClass[];
    },

    async getStudentClasssBySectionClass(term_class: TermClass): Promise<StudentClass[]> {
        
        const endpoint = `${get_endpoint_by_section_class}/${term_class._id}`;
        //console.log(endpoint);
        const data = await MyService.get(endpoint);
        return data as StudentClass[];
    },
};
