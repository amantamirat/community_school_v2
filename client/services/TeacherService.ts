import { Teacher } from "@/types/model";
import { MyService } from "./MyService";

const get_endpoint = '/api/teachers/';
const create_endpoint = '/api/teachers/create';
const update_endpoint = '/api/teachers/update';
const delete_endpoint = '/api/teachers/delete';
const upload_endpoint = '/api/teachers/upload-photo';

export const TeacherService = {    
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

    async uploadTeacherPhoto(teacher: Teacher, photo: File): Promise<Teacher> {
            if(!teacher._id){
                throw Error("ID Required!");
            }
            const formData = new FormData();
            formData.append('photo', photo);
            const data = await MyService.uploadByPUT(`${upload_endpoint}/teacher/${teacher._id}`, formData);
            return data;
        },

    async deleteTeacher(teacher: Teacher): Promise<boolean> {
        if (teacher._id) {
            const response = await MyService.delete(teacher._id, delete_endpoint);
            return response;
        }
        throw new Error("_id is required.");
    },
};
