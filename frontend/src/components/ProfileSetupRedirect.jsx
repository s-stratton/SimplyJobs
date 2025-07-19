import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import api from "../api";
import { ACCESS_TOKEN } from "../constants";
import { jwtDecode } from "jwt-decode";

export default function ProfileSetupRedirect({ children }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    let username = "";
    let account = "";
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
        try {
            const decoded = jwtDecode(token);
            username = decoded.username || "";
            account = decoded.account || "";
        } catch {
            username = "";
            account = "";
        }
    }

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get(`/api/profile/${username}/`);
                setProfile(res.data);
            } catch (err) {
                console.error(err);
                alert("Could not fetch profile.");
                setProfile(null);
            } finally {
                setLoading(false);
            }
        };

        if (username) {
            fetchProfile();
        } else {
            setLoading(false);
        }
    }, [username]);

    if (loading) return null;

    // Redirect jobseekers with incomplete profile
    if (account === "JOBSEEKER" && profile) {
        const missingRequired =
            !profile.first_name ||
            !profile.last_name ||
            !profile.email ||
            !profile.resume;

        if (missingRequired) {
            return <Navigate to="/profile-setup" replace />;
        }
    }

    return children;
}