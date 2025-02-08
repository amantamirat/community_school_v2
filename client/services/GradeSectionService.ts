import { ClassificationGrade, GradeSection } from "@/types/model";
import { MyService } from "./MyService";

const get_endpoint = "/api/grade-sections/classification_grade";
const open_endpoint = "/api/grade-sections/open";
const close_endpoint = "/api/grade-sections/close";
const create_endpoint = '/api/grade-sections/create';
const delete_endpoint = '/api/grade-sections/delete';

export const GradeSectionService = {
    async getGradeSectionsByClassificationGrade(classification_grade: ClassificationGrade): Promise<GradeSection[]> {
        const endpoint = `${get_endpoint}/${classification_grade._id}`;
        const data = await MyService.get(endpoint);
        return data as GradeSection[];
    },

    async createGradeSection(gradeSection: Partial<GradeSection>): Promise<GradeSection> {
        const createdData = await MyService.create(gradeSection, create_endpoint);
        return createdData;
    },

    async openGradeSection(gradeSection: GradeSection): Promise<GradeSection> {
        const data = await MyService.put(`${open_endpoint}/${gradeSection._id}`, {});
        return data;
    },

    async closeGradeSection(gradeSection: GradeSection): Promise<GradeSection> {
        const data = await MyService.put(`${close_endpoint}/${gradeSection._id}`, {});
        return data;
    },
    async deleteGradeSection(id: string): Promise<boolean> {
        const response = await MyService.delete(id, delete_endpoint);
        return response;
    },
};
