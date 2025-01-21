import { Department } from "@/types/model";
import { MyService } from "./MyService";

const CACHE_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds
const storageName = 'departments';
const cacheTimeStampName = 'departmentsCacheTimestamp';
const get_endpoint = '/api/departments/';
const create_endpoint = '/api/departments/create';
const update_endpoint = '/api/departments/update';
const delete_endpoint = '/api/departments/delete';

export const DepartmentService = {
    async getDepartments(): Promise<Department[]> {
        const cachedData = localStorage.getItem(storageName);
        const cacheTimestamp = localStorage.getItem(cacheTimeStampName);
        const currentTime = Date.now();
        if (cachedData && cacheTimestamp && currentTime - parseInt(cacheTimestamp) < CACHE_EXPIRATION_TIME) {
            return JSON.parse(cachedData) as Department[];
        }
        const data = await MyService.get(get_endpoint);
        localStorage.setItem(storageName, JSON.stringify(data));
        localStorage.setItem(cacheTimeStampName, currentTime.toString());
        return data as Department[];
    },

    // Create a new department
    async createDepartment(department: Department): Promise<Department> {
        const createdData = await MyService.create(department, create_endpoint);
        const cachedData = localStorage.getItem(storageName);
        if (cachedData) {
            const departments = JSON.parse(cachedData) as Department[];
            departments.push(createdData);
            localStorage.setItem(storageName, JSON.stringify(departments));
        }
        return createdData;

    },

    // Update department
    async updateDepartment(department: Department): Promise<Department> {
        if (department._id) {
            const updatedData = await MyService.update(department._id, department, update_endpoint);
            const cachedData = localStorage.getItem('departments');
            if (cachedData) {
                let departments = JSON.parse(cachedData) as Department[];
                departments = departments.map(department =>
                    department._id === updatedData._id ? updatedData : department
                );
                localStorage.setItem(storageName, JSON.stringify(departments));// Save the updated list back to localStorage
            }
            return updatedData;
        }
        throw new Error("_id is required.");
    },

    async deleteDepartment(department: Department): Promise<boolean> {
        if (department._id) {
            const response = await MyService.delete(department._id, delete_endpoint);
            const cachedData = localStorage.getItem(storageName);
            if (cachedData) {
                let departments = JSON.parse(cachedData) as Department[];
                departments = departments.filter(dept => dept._id !== department._id);
                localStorage.setItem(storageName, JSON.stringify(departments));
            }
            return response;
        }
        throw new Error("_id is required.");
    },
};
