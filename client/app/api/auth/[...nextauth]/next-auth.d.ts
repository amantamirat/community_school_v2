import "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            email: string;
            name: string;
            roles: string[];
            accessToken?: string;
        };
    }
    interface User {
        id: string;
        email: string;
        name: string;
        accessToken?: string;
        roles: string[];
    }
    interface JWT {
        accessToken?: string;  // Add accessToken here
        roles?: string[];      // If you want to keep roles
    }
}