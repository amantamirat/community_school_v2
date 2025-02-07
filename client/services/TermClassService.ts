import { GradeSection, SectionSubject, TermClass } from "@/types/model";
import { MyService } from "./MyService";

const get_endpoint = "/api/term-classes/section_subject";
const submit_endpoint = '/api/term-classes/submit';
const activate_endpoint = '/api/term-classes/activate';
const approve_endpoint = '/api/term-classes/approve';
const revoke_endpoint = '/api/term-classes/revoke';


export const TermClassService = {
    async getTermClassesBySubject(sectionSubject: SectionSubject): Promise<TermClass[]> {
        const endpoint = `${get_endpoint}/${sectionSubject._id}`;
        const data = await MyService.get(endpoint);
        return data as TermClass[];
    },

    async submitStudentResults(term_class: TermClass): Promise<TermClass> {
        const data = await MyService.put(`${submit_endpoint}/${term_class._id}`, {});
        return data;
    },

    async activateStudentResults(section_class: TermClass): Promise<TermClass> {
        const data = await MyService.put(`${activate_endpoint}/${section_class._id}`, {});
        return data;
    },

    async approveStudentResults(term_class: TermClass): Promise<TermClass> {
        const data = await MyService.put(`${approve_endpoint}/${term_class._id}`, {});
        return data as TermClass;
    },

    async revokeStudentResults(term_class: TermClass): Promise<TermClass> {
        const data = await MyService.put(`${revoke_endpoint}/${term_class._id}`, {});
        return data as TermClass;
    },
};
