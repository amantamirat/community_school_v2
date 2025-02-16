import { useSession, signOut } from "next-auth/react";


export default function Profile() {
    const { data: session, status } = useSession();

    const handleLogout = () => {
        signOut({ callbackUrl: "/landing" });
    };
    if (status === "loading") {
        return <p>Loading...</p>;
    }

    if (!session) {
        return <p>Access Denied</p>;
    }

    return <div>Welcome, {session.user?.name} <button onClick={handleLogout}>Logout</button></div>;
}