import { ClassificationGrade, ExternalStudentInfo, StudentGrade } from "@/types/model";
import { MyService } from "./MyService";

const get_endpoint = "/api/student-grades/";
const register_external_students_endpoint = '/api/student-grades/register_external_students';
const create_endpoint = '/api/student-grades/create';
const update_endpoint = '/api/student-grades/update';
const delete_endpoint = '/api/student-grades/delete';

export const StudentGradeService = {
    async registerExternalStudents(classification_grade: Partial<ClassificationGrade>, external_students: Partial<ExternalStudentInfo[]>): Promise<StudentGrade[]> {
        const selected_external_students = external_students.map(external_candidate => external_candidate?._id);        
        const createdData = await MyService.create(selected_external_students, `${register_external_students_endpoint}/${classification_grade._id}`);
        return createdData as StudentGrade[];
    },
};
