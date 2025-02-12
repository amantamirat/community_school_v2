import { ClassificationGrade, ExternalStudentInfo, Student, StudentGrade } from "@/types/model";
import { MyService } from "./MyService";


const get_new_students_endpoint = "/api/students/new_students/";
const get_endpoint = "/api/students/";
const create_endpoint = '/api/students/create';
const update_endpoint = '/api/students/update';
const delete_endpoint = '/api/students/delete';
const upload_endpoint = '/api/students/upload-photo';
const register_first_level_students_endpoint = '/api/students/register_first_level_students';

interface ExternalStudent {
    student: Student;
    external_info: ExternalStudentInfo | null;
}

export const StudentService = {
    async getStudents(): Promise<Student[]> {
        const data = await MyService.get(get_endpoint);
        return data as Student[];
    },

    async getNewStudents(): Promise<Student[]> {
        const data = await MyService.get(get_new_students_endpoint);
        return data as Student[];
    },

    async createStudent(student: Student, external_info: ExternalStudentInfo | null): Promise<Student> {
        const external_student: ExternalStudent = { student: student, external_info: external_info }
        const createdData = await MyService.create(external_student, create_endpoint);
        return createdData;
    },

    async updateStudent(student: Student): Promise<Student> {
        if (student._id) {
            const updatedStudent = await MyService.update(student._id, student, update_endpoint);
            return updatedStudent;
        }
        throw Error("ID Required!");
    },

    async registerFirstLevelStudents(classification_grade: ClassificationGrade, new_students: Student[]): Promise<any[]> {
        const selected_new_students = new_students.map(new_candidate => new_candidate?._id);
        const registeredData = await MyService.create(selected_new_students, `${register_first_level_students_endpoint}/${classification_grade._id}`);
        return registeredData;
    },


    async uploadStudentPhoto(student: Student, photo: File): Promise<Student> {
        if (!student._id) {
            throw Error("ID Required!");
        }
        const formData = new FormData();
        formData.append('photo', photo);  // 'photo' should match the field name in your backend
        const data = await MyService.uploadByPUT(`${upload_endpoint}/student/${student._id}`, formData);
        return data;
    },

    async deleteStudent(id: string): Promise<boolean> {
        const response = await MyService.delete(id, delete_endpoint);
        return response;
    },

};
