import { GradeSection, SectionSubject, TermClass } from "@/types/model";
import { MyService } from "./MyService";

const get_endpoint = "/api/term-classes/section_subject";
const approve_endpoint = '/api/term-classes/approve';


export const TermClassService = {
    async getTermClassesBySubject(sectionSubject: SectionSubject): Promise<TermClass[]> {
        const endpoint = `${get_endpoint}/${sectionSubject._id}`;
        const data = await MyService.get(endpoint);
        return data as TermClass[];
    },

    async approveStudentResults(term_class: TermClass): Promise<any> {
        const data = await MyService.put(`${approve_endpoint}/${term_class._id}`, {});
        return data;
    },
};
