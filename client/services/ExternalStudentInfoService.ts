import { ClassificationGrade, ExternalStudentInfo, Student } from "@/types/model";
import { MyService } from "./MyService";

//const get_endpoint = "/api/external-student-info/";
const get_by_student_endpoint = "/api/external-student-info/student";
const get_by_classification_grade_endpoint = "/api/external-student-info/classification_grade";
const register_external_students_endpoint = '/api/external-student-info/register_external_students';
const create_endpoint = '/api/external-student-info/create';
const update_endpoint = '/api/external-student-info/update';
const delete_endpoint = '/api/external-student-info/delete';

export const ExternalStudentInfoService = {

    async getExternalInfoByStudent(student: Student): Promise<ExternalStudentInfo[]> {
        const endpoint = `${get_by_student_endpoint}/${student._id}`;
        const data = await MyService.get(endpoint);
        return data;
    },

    async getExternalElligibleStudentsByGrade(classification_grade: ClassificationGrade): Promise<ExternalStudentInfo[]> {
        const endpoint = `${get_by_classification_grade_endpoint}/${classification_grade._id}`;        
        const data = await MyService.get(endpoint);
        //console.log(data);
        return data;
    },

    async createExternalStudentInfo(info: ExternalStudentInfo): Promise<ExternalStudentInfo> {
        const createdData = await MyService.create(info, `${create_endpoint}/${(info.student as Student)._id}`);
        return createdData;
    },

    async registerExternalStudents(classification_grade: ClassificationGrade, external_students: ExternalStudentInfo[]): Promise<any[]> {
            const selected_external_students = external_students.map(external_candidate => external_candidate?._id);
            const registeredData = await MyService.create(selected_external_students, `${register_external_students_endpoint}/${classification_grade._id}`);
            return registeredData;
        },

    async updateExternalStudentInfo(externalInfo: ExternalStudentInfo): Promise<ExternalStudentInfo> {
        if (externalInfo._id) {
            const updatedExternalStudentInfo = await MyService.update(externalInfo._id, externalInfo, update_endpoint);
            return updatedExternalStudentInfo;
        }
        throw new Error("_id is required.");
    },

    async deleteExternalStudentInfo(externalStudent: ExternalStudentInfo): Promise<boolean> {
        if (externalStudent._id) {
            const response = await MyService.delete(externalStudent._id, delete_endpoint);
            return response;
        }
        throw new Error("_id is required.");
    },
};
