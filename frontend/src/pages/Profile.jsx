import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api";
import { ACCESS_TOKEN } from "../constants";
import { jwtDecode } from "jwt-decode";
import ProfileCard, { PROFILE_CARD_WIDTH } from "../components/ProfileCard";
import { FaAngleLeft } from "react-icons/fa";

function Profile() {
    const { username } = useParams();
    const [profile, setProfile] = useState(null);
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get(`/api/profile/${username}/`);
                setProfile(res.data);
            } catch (err) {
                console.error(err);
                alert("Could not fetch profile.");
            }
        };

        fetchProfile();

        // Check if viewing own profile
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setIsOwnProfile(decoded.username === username);
            } catch {
                setIsOwnProfile(false);
            }
        }
    }, [username]);

    if (!profile) {
        return <p className="text-center mt-10 text-slate-500">Loading profile...</p>;
    }

    return (
        <div className="flex flex-col items-center px-4 py-8">
            <div className={`flex items-start w-full ${isOwnProfile ? 'mb-8 md:mb-24 lg:mb-8' : 'mb-8 md:mb-40 lg:mb-8'}`}>
                <div className="w-[44px] flex">
                    {!isOwnProfile && (
                        <button
                            onClick={() => navigate(-1)}
                            className="mx-3 my-3 rounded-md text-xl text-slate-800 hover:cursor-pointer self-center"
                            aria-label="Go back"
                        >
                            <FaAngleLeft className="w-7 h-7" />
                        </button>
                    )}
                </div>
                <h1 className="flex-1 text-3xl font-bold text-slate-800 text-center break-words">
                    {isOwnProfile
                        ? "Your Profile"
                        : `${profile.first_name} ${profile.last_name}'s Profile`}
                </h1>
                <div className="w-[44px]" />
            </div>
            <div style={{ width: PROFILE_CARD_WIDTH }}>
                {isOwnProfile && (
                    <Link
                        to="/profile/edit"
                        className="w-full mb-4 px-4 py-3 flex items-center justify-center gap-2
                            bg-white border border-slate-100 rounded-xl shadow-lg
                            text-blue-600 font-medium tracking-wide
                            hover:bg-blue-50 hover:border-blue-300
                            active:bg-blue-100
                            transition-colors duration-150 ease-in-out"
                    >
                        Edit Profile
                    </Link>
                )}
            </div>
            <ProfileCard profile={profile} />
        </div>
    );
}

export default Profile;
