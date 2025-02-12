import { ClassificationGrade, GradeSection, StudentGrade } from "@/types/model";
import { MyService } from "./MyService";

const get_nan_section_registered_students_endpoint = "/api/student-grades/nan_section_registered_students";
const get_sectioned_registered_students_endpoint = "/api/student-grades/sectioned_registered_students";
const deregister_students_endpoint = '/api/student-grades/deregister_students';
const allocate_section_endpoint = '/api/student-grades/allocate_section';
const detach_section_endpoint = '/api/student-grades/detach_section';
const update_endpoint = '/api/student-grades/update';
const delete_endpoint = '/api/student-grades/delete';
const get_elligible_students_endpoint = "/api/student-grades/get_elligible_students";
const register_students_endpoint = '/api/student-grades/register_students';

export const StudentGradeService = {

    async getRegisteredStudents(classification_grade: ClassificationGrade): Promise<StudentGrade[]> {
        const data = await MyService.get(`${get_nan_section_registered_students_endpoint}/${classification_grade._id}`);
        return data as StudentGrade[];
    },

    async getSectionedRegisteredStudents(grade_section: GradeSection): Promise<StudentGrade[]> {
        if (grade_section._id) {
            const data = await MyService.get(`${get_sectioned_registered_students_endpoint}/${grade_section._id}`);
            return data as StudentGrade[];
        }
        return this.getRegisteredStudents(grade_section.classification_grade as ClassificationGrade);
    },

    async getElligibleStudents(classification_grade: ClassificationGrade): Promise<StudentGrade[]> {
        const endpoint = `${get_elligible_students_endpoint}/${classification_grade._id}`;
        const data = await MyService.get(endpoint);
        return data;
    },

    async registerStudents(classification_grade: ClassificationGrade, returning_students: StudentGrade[]): Promise<any[]> {
        const selected_students = returning_students.map(external_candidate => external_candidate?._id);
        const registeredData = await MyService.create(selected_students, `${register_students_endpoint}/${classification_grade._id}`);
        return registeredData;
    },

    async deRegisterStudents(classification_grade: Partial<ClassificationGrade>, registred_students: Partial<StudentGrade[]>): Promise<any> {
        const selected_registred_students = registred_students.map(registred_candidate => registred_candidate?._id);
        const de_registeredData = await MyService.delete_payload(selected_registred_students, `${deregister_students_endpoint}/${classification_grade._id}`);
        return de_registeredData as any;
    },

    async assignSectionStudents(grade_section: GradeSection, registred_students: StudentGrade[]): Promise<any> {
        const selected_registred_students = registred_students.map(registred_candidate => registred_candidate?._id);
        if (grade_section._id) {
            const data = await MyService.update(grade_section._id, selected_registred_students, allocate_section_endpoint);
            return data as any;
        }
        throw new Error('I told you, grade section is required');
    },

    async detachSectionStudents(grade_section: GradeSection, sectioned_students: StudentGrade[]): Promise<any> {
        const selected_sectioned_students = sectioned_students.map(section_student => section_student?._id);
        if (grade_section._id) {
            const data = await MyService.update(grade_section._id, selected_sectioned_students, detach_section_endpoint);
            return data as any;
        }
        throw new Error('I told you, grade section is required');
    },



};
