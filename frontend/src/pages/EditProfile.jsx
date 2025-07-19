import { useState, useEffect } from 'react';
import api from '../api';
import { jwtDecode } from 'jwt-decode';
import { ACCESS_TOKEN } from '../constants';
import { useNavigate } from 'react-router-dom';
import ProfileCard from '../components/ProfileCard';
import { HiOutlineDocumentText, HiOutlinePlusSm, HiOutlineTrash } from 'react-icons/hi';
import { FaAngleLeft } from 'react-icons/fa';

function EditProfile() {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [profilePictureRemoved, setProfilePictureRemoved] = useState(false);

    let username = "";
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
        try {
            const decoded = jwtDecode(token);
            username = decoded.username || "";
        } catch (e) {}
    }

    const [profile, setProfile] = useState({
        profile_picture: null,
        profile_picture_url: "",
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        bio: "",
        resume: null,
        resume_url: "",
        city: "",
        country: "",
        educations: [],
        experiences: []
    });

    const [deletedEducationIds, setDeletedEducationIds] = useState([]);
    const [deletedExperienceIds, setDeletedExperienceIds] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileRes, educationsRes, experiencesRes] = await Promise.all([
                    api.get("/api/profile/edit/"),
                    api.get("/api/educations/"),
                    api.get("/api/experiences/")
                ]);

                const profileData = profileRes.data;
                const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

                // Handle profile picture URL
                let profilePictureUrl = "";
                if (profileData.profile_picture) {
                    profilePictureUrl = profileData.profile_picture.startsWith("http")
                        ? profileData.profile_picture
                        : `${backendUrl}${profileData.profile_picture}`;
                }

                // Handle resume URL
                let resumeUrl = "";
                if (profileData.resume) {
                    resumeUrl = profileData.resume.startsWith("http")
                        ? profileData.resume
                        : `${backendUrl}${profileData.resume}`;
                }

                setProfile({
                    ...profile,
                    first_name: profileData.first_name || "",
                    last_name: profileData.last_name || "",
                    email: profileData.email || "",
                    phone_number: profileData.phone_number || "",
                    bio: profileData.bio || "",
                    city: profileData.city || "",
                    country: profileData.country || "",
                    profile_picture_url: profilePictureUrl,
                    resume_url: resumeUrl,
                    educations: educationsRes.data,
                    experiences: experiencesRes.data
                });
            } catch (err) {
                setError("Failed to load profile data");
            }
        };

        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                if (e.target.name === 'profile_picture') {
                    setProfile(prev => ({
                        ...prev,
                        profile_picture: file,
                        profile_picture_url: reader.result
                    }));
                    setProfilePictureRemoved(false);
                } else if (e.target.name === 'resume') {
                    setProfile(prev => ({
                        ...prev,
                        resume: file,
                        resume_url: URL.createObjectURL(file)
                    }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const removeFile = () => {
        setProfile(prev => ({
            ...prev,
            profile_picture: null,
            profile_picture_url: ""
        }));
        setProfilePictureRemoved(true);
    };

    // Education handlers
    const handleEducationChange = (idx, field, value) => {
        setProfile(prev => ({
            ...prev,
            educations: prev.educations.map((edu, i) =>
                i === idx ? { ...edu, [field]: value } : edu
            )
        }));
    };

    const addEducation = () => {
        setProfile(prev => ({
            ...prev,
            educations: [
                ...prev.educations,
                { school: "", degree: "", field_of_study: "", start_date: "", end_date: "" }
            ]
        }));
        setTimeout(() => {
            const lastEdu = document.querySelector('[data-edu="last"]');
            if (lastEdu) lastEdu.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    };

    const markEducationForDeletion = (id, idx) => {
        if (id) setDeletedEducationIds([...deletedEducationIds, id]);
        setProfile(prev => ({
            ...prev,
            educations: prev.educations.filter((_, i) => i !== idx)
        }));
    };

    // Experience handlers
    const handleExperienceChange = (idx, field, value) => {
        setProfile(prev => ({
            ...prev,
            experiences: prev.experiences.map((exp, i) =>
                i === idx ? { ...exp, [field]: value } : exp
            )
        }));
    };

    const addExperience = () => {
        setProfile(prev => ({
            ...prev,
            experiences: [
                ...prev.experiences,
                { company: "", title: "", job_type: "", start_date: "", end_date: "", description: "" }
            ]
        }));
        setTimeout(() => {
            const lastExp = document.querySelector('[data-exp="last"]');
            if (lastExp) lastExp.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    };

    const markExperienceForDeletion = (id, idx) => {
        if (id) setDeletedExperienceIds([...deletedExperienceIds, id]);
        setProfile(prev => ({
            ...prev,
            experiences: prev.experiences.filter((_, i) => i !== idx)
        }));
    };

    // Save profile and related data
    const editProfile = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setIsSaving(true);

        try {
            const profileData = new FormData();
            if (profilePictureRemoved) {
                profileData.append("profile_picture", "");
            } else if (profile.profile_picture instanceof File) {
                profileData.append("profile_picture", profile.profile_picture);
            }
            profileData.append("first_name", profile.first_name);
            profileData.append("last_name", profile.last_name);
            profileData.append("email", profile.email);
            if (profile.phone_number) profileData.append("phone_number", profile.phone_number);
            if (profile.bio) profileData.append("bio", profile.bio);
            if (profile.resume) profileData.append("resume", profile.resume);
            if (profile.city) profileData.append("city", profile.city);
            if (profile.country) profileData.append("country", profile.country);

            await api.put("/api/profile/edit/", profileData);

            // Save educations
            for (const edu of profile.educations) {
                if (edu.id) {
                    await api.put(`/api/educations/${edu.id}/`, edu);
                } else {
                    await api.post("/api/educations/", edu);
                }
            }

            // Delete marked educations
            for (const id of deletedEducationIds) {
                await api.delete(`/api/educations/${id}/`);
            }
            setDeletedEducationIds([]);

            // Save experiences
            for (const exp of profile.experiences) {
                if (exp.id) {
                    await api.put(`/api/experiences/${exp.id}/`, exp);
                } else {
                    await api.post("/api/experiences/", exp);
                }
            }

            // Delete marked experiences
            for (const id of deletedExperienceIds) {
                await api.delete(`/api/experiences/${id}/`);
            }
            setDeletedExperienceIds([]);

            setSuccess("Profile updated successfully!");
            setTimeout(() => navigate(`/profile/${username}`), 1500);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className='px-4 py-8'>
            <div className="flex items-center mb-6">
                <div className="w-[48px] flex justify-start">
                    <button
                        onClick={() => navigate(-1)}
                        className="mx-3 my-3 rounded-md text-xl text-slate-800 hover:cursor-pointer"
                        aria-label="Go back"
                    >
                        <FaAngleLeft className="w-7 h-7" />
                    </button>
                </div>
                <h2 className="flex-1 text-3xl font-bold text-slate-800 text-center">
                    Edit Profile
                </h2>
                <div className="w-[48px]" />
            </div>
            <div className="bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Profile Preview */}
                        <div className="lg:w-1/3 flex justify-center">
                            <ProfileCard
                                profile={{
                                    ...profile,
                                    profile_picture: profile.profile_picture_url,
                                    resume: profile.resume_url,
                                    educations: profile.educations,
                                    experiences: profile.experiences
                                }}
                                className="sticky top-4"
                            />
                        </div>
                        {/* Edit Form */}
                        <div className="lg:w-2/3 bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
                            {error && (
                                <div className="mb-6 px-4 py-3 bg-red-100 text-red-700 rounded-lg border border-red-200">
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="mb-6 px-4 py-3 bg-green-100 text-green-700 rounded-lg border border-green-200">
                                    {success}
                                </div>
                            )}
                            <form onSubmit={editProfile} className="space-y-6">
                                {/* Personal Info Section */}
                                <div className="space-y-6">
                                    <h2 className="flex justify-center items-center text-xl font-semibold text-slate-800 border-b pb-2">Personal Information</h2>
                                    <div className="flex flex-col items-center">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Profile Picture</label>
                                        <div className="mb-2">
                                            <img
                                                src={profile.profile_picture_url || "/default-profile.png"}
                                                alt="Current profile"
                                                className="w-24 h-24 rounded-full object-cover border-2 border-white shadow-md"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => document.getElementById('profile-picture-input').click()}
                                            className="py-2 px-4 rounded-lg text-sm font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 hover:cursor-pointer mb-3"
                                        >
                                            Upload Profile Picture
                                        </button>
                                        <input
                                            type="file"
                                            id="profile-picture-input"
                                            name="profile_picture"
                                            onChange={handleFileChange}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeFile}
                                            className="text-sm font-medium text-red-600 hover:cursor-pointer flex items-center"
                                        >
                                            <HiOutlineTrash className="w-4 h-4 mr-1" />
                                            Remove Profile Picture
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                                            <input
                                                type="text"
                                                name="first_name"
                                                value={profile.first_name}
                                                onChange={handleChange}
                                                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                                            <input
                                                type="text"
                                                name="last_name"
                                                value={profile.last_name}
                                                onChange={handleChange}
                                                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={profile.email}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone_number"
                                            value={profile.phone_number}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={profile.city}
                                                onChange={handleChange}
                                                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                                            <input
                                                type="text"
                                                name="country"
                                                value={profile.country}
                                                onChange={handleChange}
                                                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
                                        <textarea
                                            name="bio"
                                            value={profile.bio}
                                            onChange={handleChange}
                                            rows={4}
                                            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Resume</label>
                                        {profile.resume_url && (
                                            <div className="mb-2">
                                                <a
                                                    href={profile.resume_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 text-sm font-medium inline-flex items-center"
                                                >
                                                    <HiOutlineDocumentText className="w-4 h-4 mr-1" />
                                                    View Current Resume
                                                </a>
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => document.getElementById('Resume-input').click()}
                                            className="py-2 px-4 rounded-lg text-sm font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 hover:cursor-pointer"
                                        >
                                            Upload Resume
                                        </button>
                                        <input
                                            type="file"
                                            id="Resume-input"
                                            name="resume"
                                            onChange={handleFileChange}
                                            accept=".pdf,.doc,.docx"
                                            className="hidden"
                                        />
                                    </div>
                                </div>
                                {/* Education Section */}
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center border-b pb-2">
                                        <h2 className="text-xl font-semibold text-slate-800">Education</h2>
                                        <button
                                            type="button"
                                            onClick={addEducation}
                                            className="text-sm font-medium text-blue-600 hover:cursor-pointer flex items-center"
                                        >
                                            <HiOutlinePlusSm className="w-4 h-4 mr-1" />
                                            Add Education
                                        </button>
                                    </div>
                                    {profile.educations.map((edu, idx) => (
                                        <div key={idx} className="p-4 border border-slate-200 rounded-lg space-y-4" data-edu={idx === profile.educations.length - 1 ? 'last' : undefined}>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">School</label>
                                                    <input
                                                        type="text"
                                                        value={edu.school}
                                                        onChange={(e) => handleEducationChange(idx, "school", e.target.value)}
                                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="University name"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Degree</label>
                                                    <input
                                                        type="text"
                                                        value={edu.degree}
                                                        onChange={(e) => handleEducationChange(idx, "degree", e.target.value)}
                                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Bachelor's, Master's, etc."
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Field of Study</label>
                                                <input
                                                    type="text"
                                                    value={edu.field_of_study}
                                                    onChange={(e) => handleEducationChange(idx, "field_of_study", e.target.value)}
                                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Computer Science, Business, etc."
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                                                    <input
                                                        type="date"
                                                        value={edu.start_date}
                                                        onChange={(e) => handleEducationChange(idx, "start_date", e.target.value)}
                                                        className="appearance-none w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:cursor-text"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                                                    <input
                                                        type="date"
                                                        value={edu.end_date}
                                                        onChange={(e) => handleEducationChange(idx, "end_date", e.target.value)}
                                                        className="appearance-none w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:cursor-text"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => markEducationForDeletion(edu.id, idx)}
                                                    className="text-sm font-medium text-red-600 hover:cursor-pointer flex items-center"
                                                >
                                                    <HiOutlineTrash className="w-4 h-4 mr-1" />
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* Experience Section */}
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center border-b pb-2">
                                        <h2 className="text-xl font-semibold text-slate-800">Experience</h2>
                                        <button
                                            type="button"
                                            onClick={addExperience}
                                            className="text-sm font-medium text-blue-600 hover:cursor-pointer flex items-center"
                                        >
                                            <HiOutlinePlusSm className="w-4 h-4 mr-1" />
                                            Add Experience
                                        </button>
                                    </div>
                                    {profile.experiences.map((exp, idx) => (
                                        <div key={idx} className="p-4 border border-slate-200 rounded-lg space-y-4" data-exp={idx === profile.experiences.length - 1 ? 'last' : undefined}>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
                                                    <input
                                                        type="text"
                                                        value={exp.company}
                                                        onChange={(e) => handleExperienceChange(idx, "company", e.target.value)}
                                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Company name"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
                                                    <input
                                                        type="text"
                                                        value={exp.title}
                                                        onChange={(e) => handleExperienceChange(idx, "title", e.target.value)}
                                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Your position"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Job Type</label>
                                                <input
                                                    type="text"
                                                    value={exp.job_type}
                                                    onChange={(e) => handleExperienceChange(idx, "job_type", e.target.value)}
                                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Full-Time, Part-Time, etc."
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                                                        <input
                                                            type="date"
                                                            value={exp.start_date}
                                                            onChange={e => handleExperienceChange(idx, "start_date", e.target.value)}
                                                            className="appearance-none w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:cursor-text"
                                                            placeholder="e.g. 2020"
                                                        />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                                                    <input
                                                        type="date"
                                                        value={exp.end_date}
                                                        onChange={(e) => handleExperienceChange(idx, "end_date", e.target.value)}
                                                        className="appearance-none w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:cursor-text"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                                <textarea
                                                    value={exp.description}
                                                    onChange={(e) => handleExperienceChange(idx, "description", e.target.value)}
                                                    rows={3}
                                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Describe your responsibilities and achievements"
                                                />
                                            </div>
                                            <div className="flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => markExperienceForDeletion(exp.id, idx)}
                                                    className="text-sm font-medium text-red-600 hover:cursor-pointer flex items-center"
                                                >
                                                    <HiOutlineTrash className="w-4 h-4 mr-1" />
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        className={`w-full bg-blue-500 hover:bg-blue-600 hover:cursor-pointer text-white font-semibold py-3 px-4 rounded-lg transition-colors${isSaving ? ' opacity-70 cursor-not-allowed' : ''}`}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? 'Saving...' : 'Save Profile'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditProfile;