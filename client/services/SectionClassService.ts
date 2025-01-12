import { GradeSection, SectionClass } from "@/types/model";
import { MyService } from "./MyService";

const get_endpoint = "/api/section-classs/grade_section";
const create_endpoint = '/api/section-classs/create';
const update_endpoint = '/api/section-classs/update';
const delete_endpoint = '/api/section-classs/delete';

function sanitize(section_class: Partial<SectionClass>) {
    return {
        ...section_class,
        grade_section: (section_class.grade_section && typeof section_class.grade_section !== 'string') ? section_class.grade_section._id : section_class.grade_section,
        grade_subject: (section_class.grade_subject && typeof section_class.grade_subject !== 'string') ? section_class.grade_subject._id : section_class.grade_subject,
        teacher: section_class.teacher && typeof section_class.teacher !== 'string' ? section_class.teacher._id : section_class.teacher
    };
}

export const SectionClassService = {
    async getSectionClasssByGradeSection(grade_section: GradeSection): Promise<SectionClass[]> {
        const endpoint = `${get_endpoint}/${grade_section._id}`;
        const data = await MyService.get(endpoint);
        return data as SectionClass[];
    },

    async createSectionClass(sectionClass: Partial<SectionClass>): Promise<SectionClass> {
        const createdData = await MyService.create(sanitize(sectionClass), create_endpoint);
        return createdData;

    },
    async updateSectionClass(id: string, sectionClass: Partial<SectionClass>): Promise<SectionClass> {
        const updatedClass = await MyService.update(id, sanitize(sectionClass), update_endpoint);
        return updatedClass;
    },

    async deleteSectionClass(id: string): Promise<boolean> {
        const response = await MyService.delete(id, delete_endpoint);
        return response;
    },
};
