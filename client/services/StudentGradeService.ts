import { ClassificationGrade, ExternalStudentInfo, GradeSection, Student, StudentGrade } from "@/types/model";
import { MyService } from "./MyService";

const get_registered_students_endpoint = "/api/student-grades/registered_students";
const register_external_students_endpoint = '/api/student-grades/register_external_students';
const register_first_level_students_endpoint = '/api/student-grades/register_first_level_students';
const deregister_students_endpoint = '/api/student-grades/deregister_students';
const allocate_section_endpoint = '/api/student-grades/allocate_section'
const update_endpoint = '/api/student-grades/update';
const delete_endpoint = '/api/student-grades/delete';

export const StudentGradeService = {
    async registerExternalStudents(classification_grade: ClassificationGrade, external_students: ExternalStudentInfo[]): Promise<StudentGrade[]> {
        const selected_external_students = external_students.map(external_candidate => external_candidate?._id);
        const registeredData = await MyService.create(selected_external_students, `${register_external_students_endpoint}/${classification_grade._id}`);
        return registeredData as StudentGrade[];
    },

    async registerFirstLevelStudents(classification_grade: ClassificationGrade, new_students: Student[]): Promise<StudentGrade[]> {
        const selected_new_students = new_students.map(new_candidate => new_candidate?._id);
        const registeredData = await MyService.create(selected_new_students, `${register_first_level_students_endpoint}/${classification_grade._id}`);
        return registeredData as StudentGrade[];
    },

    async getRegisteredStudents(classification_grade: ClassificationGrade): Promise<StudentGrade[]> {
        const data = await MyService.get(`${get_registered_students_endpoint}/${classification_grade._id}`);
        return data as StudentGrade[];
    },

    async deRegisterStudents(classification_grade: Partial<ClassificationGrade>, registred_students: Partial<StudentGrade[]>): Promise<any> {
        const selected_registred_students = registred_students.map(registred_candidate => registred_candidate?._id);
        const de_registeredData = await MyService.delete_payload(selected_registred_students, `${deregister_students_endpoint}/${classification_grade._id}`);
        return de_registeredData as any;
    },

    async assignSectionStudents(grade_section: GradeSection, registred_students: StudentGrade[]): Promise<any> {
        const selected_registred_students = registred_students.map(registred_candidate => registred_candidate?._id);
        if(grade_section._id){
            const data = await MyService.update(grade_section._id, selected_registred_students, allocate_section_endpoint);
            return data as any;
        }
        throw new Error('I told you, grade section is required');
    },

};
