import { UserService } from "@/services/UserService";
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET, // Use the secret from .env.local
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text", placeholder: "user@example.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {            
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password are required");
                }
                try {
                    const user = await UserService.loginUser(credentials.email, credentials.password);
                    if (!user) {
                        throw new Error("User not found");
                    }
                    return {
                        id: user._id, // Make sure this matches the API response
                        email: user.email,
                        name: user.username
                    };
                } catch (error) {
                    console.error("Authentication error:", error);
                    return null;
                }
            }
        })
    ],
    pages: {
        signIn: "/auth/login", // Custom login page
    },
    callbacks: {
        async session({ session, token }) {
            // Add the user ID to the session object
            if (session.user) {
                session.user.id = token.sub as string;
            }
            return session;
        },
        async jwt({ token, user }) {
            // Add the user ID to the token
            if (user) {
                token.sub = user.id;
            }
            return token;
        }
    }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };