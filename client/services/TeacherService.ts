import { Teacher } from "@/types/model";
import { MyService } from "./MyService";


const get_all_endpoint = '/api/teachers/all';
const get_endpoint = '/api/teachers/';
const create_endpoint = '/api/teachers/create';
const update_endpoint = '/api/teachers/update';
const delete_endpoint = '/api/teachers/delete';

export const TeacherService = {

    async getPopulatedTeachers(): Promise<Teacher[]> {
        const data = await MyService.get(get_all_endpoint);
        return data as Teacher[];
    },
    async getTeachers(): Promise<Teacher[]> {
        const data = await MyService.get(get_endpoint);
        return data as Teacher[];
    },

    async createTeacher(teacher: Partial<Teacher>): Promise<Teacher> {
        const createdData = await MyService.create(teacher, create_endpoint);
        return createdData;

    },
    async updateTeacher(teacher: Partial<Teacher>): Promise<Teacher> {
        if (teacher._id) {
            const updatedTeacher = await MyService.update(teacher._id, teacher, update_endpoint);
            return updatedTeacher;
        }
        throw new Error("_id is required.");
    },

    async deleteTeacher(teacher: Teacher): Promise<boolean> {
        if (teacher._id) {
            const response = await MyService.delete(teacher._id, delete_endpoint);
            return response;
        }
        throw new Error("_id is required.");
    },
};
