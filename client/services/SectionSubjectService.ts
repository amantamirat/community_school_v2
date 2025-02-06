import { GradeSection, SectionSubject } from "@/types/model";
import { MyService } from "./MyService";

const get_endpoint = "/api/section-subjects/grade_section";
const allocate_endpoint = '/api/section-subjects/allocate-teacher';
const remove_endpoint = '/api/section-subjects/remove-teacher';

export const SectionSubjectService = {
    async getSectionClasssByGradeSection(gradeSection: GradeSection): Promise<SectionSubject[]> {
        const endpoint = `${get_endpoint}/${gradeSection._id}`;
        const data = await MyService.get(endpoint);
        return data as SectionSubject[];
    },      

    async allocateTeacher(sectionSubject: SectionSubject): Promise<any> {
        const data = await MyService.put(`${allocate_endpoint}/${sectionSubject._id}`, {teacher:sectionSubject.teacher});
        return data;
    },

    async removeTeacher(sectionSubject: SectionSubject): Promise<any> {
        const response = await MyService.delete_payload(sectionSubject, `${remove_endpoint}/${sectionSubject._id}`);
        return response;
    },

    
};
