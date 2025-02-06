import { GradeSection, SectionSubject, TermClass } from "@/types/model";
import { MyService } from "./MyService";

const get_endpoint = "/api/term-classes/section_subject";


export const TermClassService = {
    async getTermClassesBySubject(sectionSubject: SectionSubject): Promise<TermClass[]> {
        const endpoint = `${get_endpoint}/${sectionSubject._id}`;
        const data = await MyService.get(endpoint);
        return data as TermClass[];
    },     
};
