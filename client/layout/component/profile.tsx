import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Password } from "primereact/password";
import { InputText } from "primereact/inputtext";

export default function Profile() {
    const { data: session, status } = useSession();
    const [showPasswordDialog, setShowPasswordDialog] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (session) {
            //console.log(session);
        }
    }, [session]);


    const handleLogout = () => {
        signOut({ callbackUrl: "/landing" });
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }
        // TODO: Send request to change password (e.g., API call)
        console.log("Changing password...", { currentPassword, newPassword });
        // Reset form & close dialog
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setError("");
        setShowPasswordDialog(false);
    };

    const displayRole = (roles: string[]) => {
        if (!roles || roles.length === 0) {
            return "N/A";
        }
        if (roles.includes("Administrator")) {
            return "Administrator";
        }
        else if (roles.includes("Principal")) {
            return "Prinicipal";
        } else if (roles.includes("Home-Teacher")) {
            return "Home-Teacher";
        }
        else if (roles.includes("Teacher")) {
            return "Teacher";
        }
        else if (roles.includes("Student")) {
            return "Student";
        }
        return "NULL";
    }

    if (status === "loading") {
        return <p>Loading...</p>;
    }

    if (!session) {
        return <p>Access Denied</p>;
    }

    return (
        <div>
            <div className="card">
                <h5>Welcome, {session.user?.name} {`( ${displayRole(session.user?.roles)})`}</h5>
                <div className="flex flex-wrap gap-2">
                    <Button label="Change Password" onClick={() => {
                        setShowPasswordDialog(true);
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                        setError("");
                    }} />
                    <Button label="Logout" severity="warning" onClick={handleLogout} />
                </div>
            </div>

            {/* Change Password Dialog */}
            <Dialog
                visible={showPasswordDialog}
                style={{ width: "400px" }}
                header="Change Password"
                modal
                onHide={() => setShowPasswordDialog(false)}
            >
                <div className="p-fluid">
                    <div className="field">
                        <label htmlFor="currentPassword">Current Password</label>
                        <Password id="currentPassword" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} toggleMask />
                    </div>

                    <div className="field">
                        <label htmlFor="newPassword">New Password</label>
                        <Password id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} toggleMask />
                    </div>

                    <div className="field">
                        <label htmlFor="confirmPassword">Confirm New Password</label>
                        <Password id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} toggleMask />
                    </div>

                    {error && <small className="p-error">{error}</small>}
                </div>

                <div className="flex justify-content-end mt-3">
                    <Button label="Cancel" onClick={() => setShowPasswordDialog(false)} className="p-button-text" />
                    <Button label="Save" onClick={handleChangePassword} disabled={!currentPassword || !newPassword || !confirmPassword} />
                </div>
            </Dialog>
        </div>
    );
}
