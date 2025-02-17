import { useSession, signOut } from "next-auth/react";
import { Button } from "primereact/button";


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

    return (<div>
        <div className="card">
            <h5> Welcome, {session.user?.name} </h5>
            <div className="flex flex-wrap gap-2">
                <Button label="Change Password"></Button>
                <Button label="Logout" severity="warning" onClick={handleLogout}></Button>

            </div>
        </div>
    </div>);
}