import { HiOutlineAcademicCap, HiOutlinePhone, HiOutlineBriefcase, HiOutlineMail, HiOutlineDocumentText, HiOutlineLocationMarker, HiOutlineChevronDown, HiOutlineChevronUp } from "react-icons/hi";
import { useState } from "react";

export const PROFILE_CARD_WIDTH =
    window.innerWidth >= 768 ? 400 : 340;
export const PROFILE_CARD_HEIGHT =
    window.innerWidth >= 768 ? 600 : 520;

function ExperienceDescription({ description }) {
    const [show, setShow] = useState(false);
    if (!show) {
        return (
            <button
                type="button"
                className="text-xs text-blue-600 hover:cursor-pointer mt-1 flex items-center"
                onClick={() => setShow(true)}
            >
                <HiOutlineChevronDown className="w-4 h-4 mr-1" />
                Show description
            </button>
        );
    }
    return (
        <>
            <div className="bg-blue-50 border border-slate-200 rounded-md px-3 py-2 mt-2 text-xs text-gray-500 whitespace-pre-line leading-relaxed">
                {description}
            </div>
            <button
                type="button"
                className="text-xs text-blue-600 hover:cursor-pointer mt-2 flex items-center"
                onClick={() => setShow(false)}
            >
                <HiOutlineChevronUp className="w-4 h-4 mr-1" />
                Hide description
            </button>
        </>
    );
}

function ProfileCard({ profile, isTop = true, style, className, scrollable = true }) {
    return (
        <div
            className={`rounded-xl overflow-hidden border border-slate-100 bg-white ${isTop ? "shadow-lg" : "shadow-none"} flex flex-col transition-all${className ? ` ${className}` : ""}`}
            style={{
                width: PROFILE_CARD_WIDTH,
                height: PROFILE_CARD_HEIGHT,
                ...style,
            }}
        >
            {/* Profile Header with Photo */}
            <div className="relative h-16 bg-gradient-to-r from-blue-50 to-indigo-50">
                <img
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-24 h-24 rounded-full border-4 border-white shadow-md object-cover"
                    src={profile.profile_picture || "/default-profile.png"}
                    alt="Profile"
                />
            </div>
            <div className={`p-6 flex-1 flex flex-col pt-16 ${scrollable ? "overflow-y-auto" : "overflow-y-hidden"}`}>
                {/* Name and Location */}
                <div className="text-center mb-4">
                    <h3 className="font-bold text-2xl text-gray-900">
                        {profile.first_name} {profile.last_name}
                    </h3>
                    {(profile.city || profile.country) && (
                        <div className="flex items-center justify-center gap-1 text-gray-500 text-sm mt-2">
                            <HiOutlineLocationMarker className="w-4 h-4" />
                            <span>
                                {profile.city && profile.country
                                    ? `${profile.city}, ${profile.country}`
                                    : profile.city || profile.country}
                            </span>
                        </div>
                    )}
                </div>
                {/* Divider if any section exists */}
                {(profile.bio || profile.resume || (profile.educations && profile.educations.length > 0) || (profile.experiences && profile.experiences.length > 0)) && (
                    <div className="border-t border-gray-100 my-3"></div>
                )}
                {/* Bio */}
                <div className="mb-4 text-center">
                    <p className="text-gray-700 text-sm leading-relaxed">
                        {profile.bio}
                    </p>
                </div>
                {/* Resume Link */}
                {profile.resume && (
                    <a
                        href={profile.resume}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-blue-50 text-blue-600 rounded-lg py-2 px-4 text-sm font-medium mb-4 hover:bg-blue-100 transition-colors"
                    >
                        <HiOutlineDocumentText className="w-4 h-4" />
                        View Resume
                    </a>
                )}
                {/* Education */}
                {profile.educations && profile.educations.length > 0 && (
                    <div className="mb-3">
                        <div className="flex items-start gap-3">
                            <div className="bg-indigo-50 p-2 rounded-lg">
                                <HiOutlineAcademicCap className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Education</h4>
                                {profile.educations.map((edu, idx) => (
                                    <div key={idx} className="mb-2">
                                        <p className="text-sm text-gray-800">
                                            {edu.degree} in {edu.field_of_study}
                                        </p>
                                        <p className="text-xs text-gray-500">{edu.school}</p>
                                        {edu.start_date && edu.end_date && (
                                            <p className="text-xs text-gray-500">{edu.start_date} - {edu.end_date}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {/* Experience */}
                {profile.experiences && profile.experiences.length > 0 && (
                    <div className="mt-auto">
                        <div className="flex items-start gap-3">
                            <div className="bg-blue-50 p-2 rounded-lg">
                                <HiOutlineBriefcase className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Experience</h4>
                                {profile.experiences.map((exp, idx) => (
                                    <div key={idx} className="mb-2">
                                        <p className="text-sm text-gray-800 font-medium">
                                            {exp.title} at {exp.company}
                                        </p>
                                        <p className="text-xs text-gray-500">{exp.job_type}</p>
                                        {exp.start_date && exp.end_date && (
                                            <p className="text-xs text-gray-500">{exp.start_date} - {exp.end_date}</p>
                                        )}
                                        {exp.description && (
                                            <ExperienceDescription description={exp.description} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {/* Contact Info */}
                <div className="mt-2 pt-3 border-t border-gray-100">
                    {profile.email && (
                        <p className="flex items-center justify-center gap-2 text-sm text-gray-600">
                            <HiOutlineMail className="w-4 h-4" />
                            {profile.email}
                        </p>
                    )}
                    {profile.phone_number && (
                        <p className="flex items-center justify-center gap-2 text-sm text-gray-600 mt-2">
                            <HiOutlinePhone className="w-4 h-4" />
                            {profile.phone_number || "Phone Number"}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProfileCard;