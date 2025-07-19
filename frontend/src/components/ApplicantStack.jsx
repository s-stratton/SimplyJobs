import { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import ProfileCard from "./ProfileCard";
import { HiArrowRight, HiEye, HiCheck, HiX, HiBan, HiOutlineDocumentText } from "react-icons/hi";
import { HiArrowsPointingIn, HiArrowsPointingOut } from "react-icons/hi2";
import { TutorialCard, TutorialRotate } from "./TutorialCard";
import api from "../api";
import { jwtDecode } from "jwt-decode";
import { ACCESS_TOKEN } from "../constants";
import { PROFILE_CARD_WIDTH, PROFILE_CARD_HEIGHT } from "./ProfileCard";
import { TUTORIAL_CARD_WIDTH, TUTORIAL_CARD_HEIGHT } from "./TutorialCard";

// Prevent background scroll when overlay  is open
function lockBodyScroll() {
    document.body.style.overflow = "hidden";
}
function unlockBodyScroll() {
    document.body.style.overflow = "";
}

function CardRotate({ children, onSendToBack, onShortlist, onReject, sensitivity }) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-100, 100], [60, -60]);
    const rotateY = useTransform(x, [-100, 100], [-60, 60]);


    function handleDragStart() {
        lockBodyScroll();
    }

    function handleDragEnd(_, info) {
        unlockBodyScroll();
        if (info.offset.x > sensitivity) {
            onShortlist();
            onSendToBack();
        } else if (info.offset.x < -sensitivity) {
            onReject();
            onSendToBack();
        } else {
            x.set(0);
            y.set(0);
        }
    }

    return (
        <motion.div
            className="absolute cursor-grab"
            style={{ x, y, rotateX, rotateY }}
            drag="x"
            dragConstraints={{ right: 0, left: 0 }}
            dragElastic={0.6}
            whileTap={{ cursor: "grabbing" }}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            {children}
        </motion.div>
    );
}

export default function ApplicantStack({
    applicants = [],
    onStatusChange,
    onSkipApplicant,
    view,
    sensitivity = 100,
    currentFilter = "PENDING",
}) {
    const [selected, setSelected] = useState([]);
    const [localApplicants, setLocalApplicants] = useState(applicants);
    const [confirmAction, setConfirmAction] = useState(null);
    const [showTutorial, setShowTutorial] = useState(false);
    const [expandedApplicantId, setExpandedApplicantId] = useState(null);

    useEffect(() => {
        if (expandedApplicantId) {
            lockBodyScroll();
            return () => unlockBodyScroll();
        } else {
            unlockBodyScroll();
        }
    }, [expandedApplicantId]);

    useEffect(() => {
        setLocalApplicants(applicants);
    }, [applicants]);

    // Show tutorial overlay for employers who haven't seen it
    useEffect(() => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        let username = null;
        let account = null;
        if (token) {
            try {
                const decoded = jwtDecode(token);
                username = decoded.username;
                account = decoded.account;
            } catch {}
        }
        if (username && account === "EMPLOYER") {
            api.get("/api/tutorial_seen/")
                .then(res => {
                    if (res.data && res.data.has_seen_tutorial === false) {
                        setShowTutorial(true);
                    }
                })
                .catch(() => {});
        }
    }, []);

    const sendToBack = (id) => {
        setLocalApplicants(prev => {
            if (prev.length < 2) return prev;
            const idx = prev.findIndex(a => a.id === id);
            if (idx === -1) return prev;
            const newArr = [...prev];
            const [removed] = newArr.splice(idx, 1);
            newArr.push(removed);
            return newArr;
        });
    };

    const handleStatusChange = (ids, newStatus) => {
        onStatusChange(ids, newStatus);
        setSelected([]);
    };

    const handleSelect = (id) => {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    return (
        <div>
            {expandedApplicantId && (
                <div className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center">
                    {(() => {
                        const applicant = localApplicants.find(a => a.id === expandedApplicantId);
                        if (!applicant) return null;
                        return (
                            <div
                                key={applicant.id}
                                className="overflow-y-auto relative rounded-xl"
                                style={{ width: PROFILE_CARD_WIDTH, height: PROFILE_CARD_HEIGHT }}
                            >
                                <button
                                    className="absolute left-1/2 bottom-4 -translate-x-1/2 flex items-center justify-center bg-white/80 border border-slate-200 shadow p-3 rounded-full text-blue-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 hover:cursor-pointer z-10 transition-all duration-150"
                                    onClick={() => setExpandedApplicantId(null)}
                                >
                                    <HiArrowsPointingIn className="w-7 h-7 stroke-1" />
                                </button>
                                <div>
                                    <ProfileCard profile={applicant.jobseeker} isTop={true} scrollable={true} />
                                </div>
                            </div>
                        );
                    })()}
                </div>
            )}
            {showTutorial && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm">
                    <div
                        style={{ perspective: 600, width: TUTORIAL_CARD_WIDTH, height: TUTORIAL_CARD_HEIGHT }}
                        className="relative translate-y-[-30px]"
                    >
                        <button
                            className="w-full mb-8 px-4 py-3 flex items-center justify-center gap-2
                                bg-white/70 border border-slate-100 rounded-xl shadow-sm
                                text-blue-600 font-medium tracking-wide
                                hover:bg-blue-50/70 hover:border-blue-300 hover:shadow-md
                                active:bg-blue-100/70
                                transition-colors duration-150 ease-in-out"
                        >
                            <HiArrowRight className="text-lg" />
                            Click to <b className="text-blue-600">skip</b> applicant
                        </button>
                        <TutorialRotate>
                            <TutorialCard
                                onClose={() => {
                                    setShowTutorial(false);
                                    api.patch("/api/tutorial_seen/");
                                }}
                                leftText={"reject"}
                                rightText={"shortlist"}
                            />
                        </TutorialRotate>
                    </div>
                </div>
            )}
            {view === "stack" ? (
                <div className="relative mx-auto" style={{ width: PROFILE_CARD_WIDTH }}>
                    {localApplicants.length > 1 && !expandedApplicantId && (
                        <button
                            onClick={() => onSkipApplicant(localApplicants[localApplicants.length - 1].id)}
                            className="w-full mb-4 px-4 py-3 flex items-center justify-center gap-2
                                bg-white border border-slate-100 rounded-xl shadow-sm
                                text-blue-600 font-medium tracking-wide
                                hover:bg-blue-50 hover:border-blue-300 hover:shadow-md
                                active:bg-blue-100
                                transition-colors duration-150 ease-in-out"
                        >
                            <HiArrowRight className="text-lg" />
                            Skip
                        </button>
                    )}
                    <div
                        className="relative mx-auto"
                        style={{ width: PROFILE_CARD_WIDTH, height: PROFILE_CARD_HEIGHT, perspective: 600 }}
                    >
                        {localApplicants.length === 0 ? (
                            <div>
                                <p>No applicants in this category</p>
                            </div>
                        ) : (
                            localApplicants.map((applicant, index) => {
                                if (expandedApplicantId === applicant.id) return null;
                                return (
                                    <CardRotate
                                        key={applicant.id}
                                        onSendToBack={() => sendToBack(applicant.id)}
                                        onShortlist={() => {
                                            if (applicant.status?.toUpperCase() !== "SHORTLISTED") {
                                                handleStatusChange([applicant.id], "SHORTLISTED");
                                            }
                                        }}
                                        onReject={() => {
                                            if (applicant.status?.toUpperCase() !== "REJECTED") {
                                                handleStatusChange([applicant.id], "REJECTED");
                                            }
                                        }}
                                        sensitivity={sensitivity}
                                    >
                                        <motion.div
                                            className="w-full h-full relative"
                                            animate={{
                                                rotateZ: 0,
                                                transformOrigin: "90% 90%",
                                            }}
                                            initial={false}
                                            transition={{
                                                type: "spring",
                                                stiffness: 260,
                                                damping: 20,
                                            }}
                                        >
                                            <ProfileCard profile={applicant.jobseeker} isTop={index === localApplicants.length - 1} scrollable={false} />
                                            {index === localApplicants.length - 1 && (
                                                <button
                                                    className="absolute left-1/2 bottom-4 -translate-x-1/2 flex items-center justify-center bg-white/80
                                                               border border-slate-200 shadow p-3 rounded-full text-blue-600 hover:bg-blue-50
                                                             hover:border-blue-300 hover:text-blue-700 hover:cursor-pointer z-10 transition-all duration-150"
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        if (!expandedApplicantId) {
                                                            window.scrollTo(0, 0);
                                                            setExpandedApplicantId(applicant.id);
                                                        }
                                                    }}
                                                    title="Expand profile"
                                                >
                                                    <HiArrowsPointingOut className="w-7 h-7 stroke-1" />
                                                </button>
                                            )}
                                        </motion.div>
                                    </CardRotate>
                                );
                            })
                        )}
                    </div>
                </div>
            ) : (
                <div>
                    {applicants.length === 0 ? (
                        <p className="text-gray-500 text-center mt-8">No applicants in this category</p>
                    ) : (
                        <>
                            <div className="flex justify-center items-center gap-2 mb-4">
                                <button
                                    disabled={selected.length === 0 || confirmAction}
                                    onClick={() => setConfirmAction("DESELECT")}
                                    className={`flex items-center gap-1 px-3 py-2 rounded-lg border font-medium transition
                                        ${selected.length === 0 || confirmAction
                                            ? "bg-white text-gray-300 border-gray-200 cursor-not-allowed"
                                            : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100 hover:text-gray-700"
                                        }`}
                                    title="Deselect"
                                >
                                    <HiBan className="w-4 h-4" />
                                </button>
                                {currentFilter !== "SHORTLISTED" && (
                                    <button
                                        disabled={selected.length === 0 || confirmAction}
                                        onClick={() => setConfirmAction("SHORTLISTED")}
                                        className={`flex items-center gap-1 px-3 py-2 rounded-lg border font-medium transition
                                            ${selected.length === 0 || confirmAction
                                                ? "bg-white text-gray-300 border-gray-200 cursor-not-allowed"
                                                : "bg-white text-gray-600 border-gray-300 hover:bg-green-100 hover:text-green-700"
                                            }`}
                                        title="Shortlist"
                                    >
                                        <HiCheck className="w-4 h-4" />
                                    </button>
                                )}
                                {currentFilter !== "REJECTED" && (
                                    <button
                                        disabled={selected.length === 0 || confirmAction}
                                        onClick={() => setConfirmAction("REJECTED")}
                                        className={`flex items-center gap-1 px-3 py-2 rounded-lg border font-medium transition
                                            ${selected.length === 0 || confirmAction
                                                ? "bg-white text-gray-300 border-gray-200 cursor-not-allowed"
                                                : "bg-white text-gray-600 border-gray-300 hover:bg-red-100 hover:text-red-700"
                                            }`}
                                        title="Reject"
                                    >
                                        <HiX className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            
                            {confirmAction && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10">
                                    <div className="bg-white rounded-xl shadow-2xl p-6 max-w-xs w-full">
                                        <h3 className="text-lg font-semibold mb-2">
                                            {confirmAction === "SHORTLISTED"
                                                ? "Shortlist"
                                                : confirmAction === "REJECTED"
                                                ? "Reject"
                                                : "Deselect"} {selected.length} applicant{selected.length > 1 ? "s" : ""}?
                                        </h3>
                                        <p className="mb-4 text-gray-600">
                                            {confirmAction === "SHORTLISTED"
                                                ? `Are you sure you want to shortlist the selected applicant${selected.length > 1 ? "s" : ""}?`
                                                : confirmAction === "REJECTED"
                                                ? `Are you sure you want to reject the selected applicant${selected.length > 1 ? "s" : ""}?`
                                                : `Are you sure you want to deselect the selected applicant${selected.length > 1 ? "s" : ""}?`}
                                        </p>
                                        <div className="flex gap-2 justify-end">
                                            <button
                                                onClick={() => setConfirmAction(null)}
                                                className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirmAction === "DESELECT") {
                                                        setSelected([]);
                                                    } else {
                                                        handleStatusChange(selected, confirmAction);
                                                    }
                                                    setConfirmAction(null);
                                                }}
                                                className={`px-4 py-2 rounded ${
                                                    confirmAction === "SHORTLISTED"
                                                        ? "bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800"
                                                        : confirmAction === "REJECTED"
                                                        ? "bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800"
                                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                }`}
                                            >
                                                Confirm
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white shadow">
                                {applicants.map(applicant => (
                                    <li
                                        key={applicant.id}
                                        className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-4 py-3"
                                    >
                                        <div className="flex items-center gap-2 sm:gap-4 w-full">
                                            <input
                                                type="checkbox"
                                                checked={selected.includes(applicant.id)}
                                                onChange={() => handleSelect(applicant.id)}
                                                className="accent-blue-600 w-4 h-4"
                                            />
                                            <span className="flex-1 min-w-0 text-gray-800 font-medium flex items-center gap-1 sm:gap-2">
                                                {applicant.jobseeker?.first_name} {applicant.jobseeker?.last_name}
                                            </span>
                                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 ml-auto">
                                                {applicant.jobseeker.resume && (
                                                    <a
                                                        href={applicant.jobseeker.resume}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1 bg-blue-50 text-blue-600 rounded-lg py-1 px-2 text-xs
                                                                   font-medium hover:bg-blue-100 transition-colors whitespace-nowrap"
                                                    >
                                                        <HiOutlineDocumentText className="w-4 h-4" />
                                                        View Resume
                                                    </a>
                                                )}
                                                <button
                                                    type="button"
                                                    className="flex items-center text-blue-600 text-xs font-medium hover:underline"
                                                    onClick={() => setExpandedApplicantId(applicant.id)}
                                                    title="View Profile"
                                                >
                                                    <HiEye className="w-4 h-4 ml-2 mr-1" />
                                                    View Profile
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}