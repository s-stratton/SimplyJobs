import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Stepper, { Step } from '../components/Stepper';
import api from '../api';
import { HiOutlineDocumentText } from 'react-icons/hi';

export default function ProfileSetup() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState({
        first_name: "",
        last_name: "",
        email: "",
        resume: null,
        resume_url: "",
    });
    const [currentStep, setCurrentStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // Validation for each step
    const canProceed =
        (currentStep === 1 && profile.first_name.trim() && profile.last_name.trim()) ||
        (currentStep === 2 && profile.resume) ||
        (currentStep === 3 && profile.email.trim()) ||
        currentStep > 3;

    // Submit profile data
    async function handleFinalStep() {
        setSubmitting(true);
        setSubmitError("");
        setSubmitSuccess(false);
        try {
            const profileData = new FormData();
            profileData.append("first_name", profile.first_name);
            profileData.append("last_name", profile.last_name);
            profileData.append("email", profile.email);
            if (profile.resume) profileData.append("resume", profile.resume);
            await api.put("/api/profile/edit/", profileData);
            setSubmitSuccess(true);
            setTimeout(() => navigate("/"), 1200);
        } catch (err) {
            setSubmitError("Failed to submit profile. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    // Handle resume file selection and preview
    const handleResumeChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setProfile(prev => ({
                    ...prev,
                    resume: file,
                    resume_url: URL.createObjectURL(file)
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="flex flex-center min-h-dvh bg-white">
            <Stepper
                initialStep={1}
                step={currentStep}
                onStepChange={setCurrentStep}
                canProceed={!!canProceed && !submitting}
                onFinalStepCompleted={handleFinalStep}
                nextButtonText={currentStep === 4 ? (submitting ? "Submitting..." : "Complete") : undefined}
            >
                <Step>
                    <h1 className="text-2xl font-semibold mb-4">Welcome to SimplyJobs!</h1>
                    <p className="text-md text-slate-700 mb-4">
                        Please fill out the following information to set up your profile.
                    </p>
                    <h2>Your Name <span className="text-red-500">*</span></h2>
                    <input
                        value={profile.first_name}
                        onChange={e => setProfile({ ...profile, first_name: e.target.value })}
                        placeholder="First Name"
                        className="w-full p-2 border rounded mt-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        value={profile.last_name}
                        onChange={e => setProfile({ ...profile, last_name: e.target.value })}
                        placeholder="Last Name"
                        className="w-full p-2 border rounded mt-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </Step>
                <Step>
                    <h2>Upload Resume <span className="text-red-500">*</span></h2>
                    <div className="w-full mt-2">
                        <div className="relative w-full">
                            <input
                                id="Resume-input"
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={handleResumeChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{ display: 'block' }}
                                tabIndex={-1}
                            />
                            <button
                                type="button"
                                onClick={() => document.getElementById('Resume-input').click()}
                                className="text-left w-full p-2 border rounded mb-1 active:outline-none active:ring-2 active:ring-blue-500 relative z-10"
                            >
                                {profile.resume ? `Selected: ${profile.resume.name}` : 'Choose File'}
                            </button>
                        </div>
                        {profile.resume_url && (
                            <a
                                href={profile.resume_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline hover:text-blue-800 text-sm mt-2 flex items-center gap-1"
                                style={{ position: 'relative', zIndex: 20 }}
                            >
                                <HiOutlineDocumentText className="w-4 h-4" />
                                <span>View Resume</span>
                            </a>
                        )}
                    </div>
                </Step>
                <Step>
                    <h2>Email Address <span className="text-red-500">*</span></h2>
                    <input
                        type="email"
                        value={profile.email}
                        onChange={e => setProfile({ ...profile, email: e.target.value })}
                        placeholder="Email"
                        className="w-full p-2 border rounded mt-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 relative z-10"
                    />
                </Step>
                <Step>
                    <h2 className="text-2xl font-semibold mb-2">Almost Done!</h2>
                    {submitting && <p className="text-blue-600 mb-2">Submitting profile...</p>}
                    {submitSuccess && <p className="text-green-600 mb-2">Profile submitted!</p>}
                    {submitError && <p className="text-red-600 mb-2">{submitError}</p>}
                    {!submitting && !submitSuccess && !submitError && (
                        <div className="bg-blue-50 border border-blue-200 rounded p-4 text-blue-900 text-base leading-relaxed">
                            <span className="block mb-1">Click <b>Complete</b> to finish your basic profile setup.</span>
                            <span className="block">You can add more details anytime from your <b>Profile</b> page.</span>
                        </div>
                    )}
                </Step>
            </Stepper>
        </div>
    );
}