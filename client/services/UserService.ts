import { User } from "@/types/model";
import { MyService } from "./MyService";

const get_endpoint = '/api/users/';
const create_endpoint = '/api/users/create';
const login_endpoint = '/api/users/login';
const update_endpoint = '/api/users/update';
const delete_endpoint = '/api/users/delete';
const upload_endpoint = '/api/users/upload-photo';

export const UserService = {
    async getUsers(): Promise<User[]> {
        const data = await MyService.get(get_endpoint);
        return data as User[];
    },

    async createUser(user: Partial<User>): Promise<User> {
        const createdData = await MyService.create(user, create_endpoint);
        return createdData;
    },

    async loginUser(email: string, password: string): Promise<any> {
        const loggedinUser = await MyService.create({ email: email, password: password }, login_endpoint);
        return loggedinUser;

    },
    async updateUser(user: Partial<User>): Promise<User> {
        if (user._id) {
            const updatedUser = await MyService.update(user._id, user, update_endpoint);
            return updatedUser;
        }
        throw new Error("_id is required.");
    },

    async uploadUserPhoto(user: User, photo: File): Promise<User> {
        if (!user._id) {
            throw Error("ID Required!");
        }
        const formData = new FormData();
        formData.append('photo', photo);
        const data = await MyService.uploadByPUT(`${upload_endpoint}/user/${user._id}`, formData);
        return data;
    },

    async deleteUser(user: User): Promise<boolean> {
        if (user._id) {
            const response = await MyService.delete(user._id, delete_endpoint);
            return response;
        }
        throw new Error("_id is required.");
    },
};
