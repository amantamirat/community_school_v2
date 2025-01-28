import { TermClass, StudentGrade, SectionClass } from "@/types/model";
import { MyService } from "./MyService";
const CACHE_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds
const storageName = 'termClasss';
const cacheTimeStampName = 'termClasssCacheTimestamp'

const get_endpoint_by_section_class = '/api/term-classes';

export const TermClassService = {
    async getTermClasssBySectionClass(section_class: SectionClass): Promise<TermClass[]> {
        const endpoint = `${get_endpoint_by_section_class}/${section_class._id}`;
        const data = await MyService.get(endpoint);
        return data as TermClass[];
    },
};
