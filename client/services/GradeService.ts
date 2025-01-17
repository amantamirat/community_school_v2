import { Grade } from "@/types/model";
import { MyService } from "./MyService";

const CACHE_EXPIRATION_TIME = 3 * 60 * 60 * 1000; // 3*60 minutes in milliseconds
const storageName = 'grades';
const cacheTimeStampName = 'gradesCacheTimestamp'
const get_endpoint = "/api/grades/";

export const GradeService = {
    async getGrades(): Promise<Grade[]> {
        try {
            const cachedData = localStorage.getItem(storageName);
            const cacheTimestamp = localStorage.getItem(cacheTimeStampName);
            const currentTime = Date.now();
            if (cachedData && cacheTimestamp && currentTime - parseInt(cacheTimestamp) < CACHE_EXPIRATION_TIME) {
                return JSON.parse(cachedData) as Grade[];
            }
            const data = await MyService.get(get_endpoint);
            localStorage.setItem(storageName, JSON.stringify(data));
            localStorage.setItem(cacheTimeStampName, currentTime.toString());
            return data as Grade[];
        } catch (error) {
            console.error('Error fetching grade data:', error);
            throw error;
        }
    },
    /*
    async findGradeById(id: string): Promise<Grade> {
        const grades: Grade[] = await this.getGrades();
        for (const grade of grades) {
            if (grade._id === id) {
                return grade;
            }
        }
        throw Error("Could Not Find Grade");
    },*/
    async getFirstLevelGrades(): Promise<Grade[]> {
        const grades: Grade[] = await this.getGrades();
        const levelOneGrades = [];
        for (const grade of grades) {
            if (grade.level === 1) {
                levelOneGrades.push(grade);
            }
        }
        return levelOneGrades;
    }
}