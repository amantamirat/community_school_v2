import { GradeSection, SectionClass } from "@/types/model";
import { MyService } from "./MyService";

const get_endpoint = "/api/section-classs/grade_section";
const get_active_endpoint = "/api/section-classs/active/grade_section";
const create_endpoint = '/api/section-classs/create';
const update_endpoint = '/api/section-classs/update';
const allocate_endpoint = '/api/section-classs/allocate-teacher';
const remove_endpoint = '/api/section-classs/remove-teacher';
const delete_endpoint = '/api/section-classs/delete';

function sanitize(section_class: Partial<SectionClass>) {
    return {
        ...section_class,
        grade_section: (section_class.grade_section && typeof section_class.grade_section !== 'string') ? section_class.grade_section._id : section_class.grade_section,
        grade_subject: (section_class.subject_term && typeof section_class.subject_term !== 'string') ? section_class.subject_term._id : section_class.subject_term,
        teacher: section_class.teacher && typeof section_class.teacher !== 'string' ? section_class.teacher._id : section_class.teacher
    };
}

export const SectionClassService = {
    async getSectionClasssByGradeSection(grade_section: GradeSection): Promise<SectionClass[]> {
        const endpoint = `${get_endpoint}/${grade_section._id}`;
        const data = await MyService.get(endpoint);
        return data as SectionClass[];
    },

    async getActiveSectionClasssByGradeSection(grade_section: GradeSection): Promise<SectionClass[]> {
        const endpoint = `${get_active_endpoint}/${grade_section._id}`;
        const data = await MyService.get(endpoint);
        return data as SectionClass[];
    },

    async createSectionClass(sectionClass: Partial<SectionClass>): Promise<SectionClass> {
        throw new Error("Unimplemented Function");
        const createdData = await MyService.create(sanitize(sectionClass), create_endpoint);
        return createdData;

    },

    async allocateTeacher(sectionClass: SectionClass): Promise<any> {
        const data = await MyService.put(allocate_endpoint, sectionClass);
        return data;
    },

    async removeTeacherClass(sectionClass: SectionClass): Promise<boolean> {
        if (!sectionClass._id) {
            throw new Error("Class Id required.");
        }
        const response = await MyService.delete_payload(sectionClass, `${remove_endpoint}/${sectionClass._id}`);
        return response;
    },

    async updateSectionClass(id: string, sectionClass: Partial<SectionClass>): Promise<SectionClass> {
        throw new Error("Unimplemented Function");
        const updatedClass = await MyService.update(id, sanitize(sectionClass), update_endpoint);
        return updatedClass;
    },

    async deleteSectionClass(id: string): Promise<boolean> {
        //throw new Error("Unimplemented Function");
        const response = await MyService.delete(id, delete_endpoint);
        return response;
    },
};
