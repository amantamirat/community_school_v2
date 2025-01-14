import { Student } from "@/types/model";
import { MyService } from "./MyService";

const get_endpoint = "/api/students/";
const create_endpoint = '/api/students/create';
const update_endpoint = '/api/students/update';
const delete_endpoint = '/api/students/delete';

export const StudentService = {
    async getStudents(): Promise<Student[]> {
        const data = await MyService.get(get_endpoint);
        return data as Student[];
    },

    async createStudent(student: Partial<Student>): Promise<Student> {
        const createdData = await MyService.create(student, create_endpoint);
        return createdData;

    },

    async updateStudent(id: string, student: Partial<Student>): Promise<Student> {
        const updatedStudent = await MyService.update(id, student, update_endpoint);
        return updatedStudent;
    },

    async deleteStudent(id: string): Promise<boolean> {
        const response = await MyService.delete(id, delete_endpoint);
        return response;
    },
};
