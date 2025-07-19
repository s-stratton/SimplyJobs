import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import { jwtDecode } from "jwt-decode";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import '../styles/index.css';
import { FaHome, FaUser, FaPlus, FaSignOutAlt, FaClipboardList } from "react-icons/fa";

export default function Container() {
    const navigate = useNavigate();
    const location = useLocation();

    let username = "";
    let account = "";
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
        try {
            const decoded = jwtDecode(token);
            username = decoded.username || "";
            account = decoded.account || "";
        } catch (e) {}
    }

    const handleLogout = () => {
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);
        localStorage.clear();
        navigate("/login");
    };

    // Dock magnification effect
    const dockRef = useRef(null);
    const mouseX = useMotionValue(Infinity);
    // Disable magnification on small screens
    const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Navigation items config
    const navItems = [
        {
            label: "Home",
            icon: <FaHome size={22} />,
            to: "/",
            show: true,
        },
        {
            label: "My Applications",
            icon: <FaClipboardList size={22} />,
            to: "/applied",
            show: account === "JOBSEEKER",
        },
        {
            label: "Profile",
            icon: <FaUser size={22} />,
            to: `/profile/${username}`,
            show: account === "JOBSEEKER",
        },
        {
            label: "Create Job",
            icon: <FaPlus size={22} />,
            to: "/create-job",
            show: account === "EMPLOYER",
        },
    ];

    // Add logout as a dock item
    const dockItems = [
        ...navItems.filter(item => item.show),
        {
            label: "Logout",
            icon: <FaSignOutAlt size={22} />,
            onClick: handleLogout,
            isButton: true,
        }
    ];

    // Dock item settings
    const baseSize = 48;
    const maxSize = 72;
    const distance = 120;

    // Track unseen applications for notification dot
    const [hasUnseen, setHasUnseen] = useState(() => localStorage.getItem("hasUnseenApplications") === "true");

    const updateUnseen = () => {
        setHasUnseen(localStorage.getItem("hasUnseenApplications") === "true");
    };

    useEffect(() => {
        window.addEventListener("hasUnseenApplications", updateUnseen);
        window.addEventListener("storage", updateUnseen);

        // Initial check
        updateUnseen();

        return () => {
            window.removeEventListener("hasUnseenApplications", updateUnseen);
            window.removeEventListener("storage", updateUnseen);
        };
    }, []);

    useEffect(() => {
        if (location.pathname === "/applied") {
            localStorage.setItem("hasUnseenApplications", "false");
            setHasUnseen(false);
        }
    }, [location.pathname]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
            <motion.nav
                ref={dockRef}
                initial={{ y: 80, opacity: 0, scale: 0.96 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 120, damping: 14 }}
                className="fixed bg-white/90 flex items-end gap-6 px-4 py-2 left-1/2 translate-x-[-50%] 
                           bottom-[32px] rounded-2xl backdrop-blur-md text-slate-700 shadow-xl z-10 border border-slate-200"
                onMouseMove={e => {
                    if (!isMobile) mouseX.set(e.clientX);
                }}
                onMouseLeave={() => {
                    if (!isMobile) mouseX.set(Infinity);
                }}
            >
                {dockItems.map((item, idx) => {
                    const itemRef = useRef(null);

                    // Calculate scale based on mouse distance, or disable on mobile/tablet
                    const isSmallScreen = window.innerWidth < 1024;
                    const scale = isSmallScreen
                        ? 1
                        : useTransform(mouseX, (x) => {
                            if (!itemRef.current) return 1;
                            const rect = itemRef.current.getBoundingClientRect();
                            const itemCenter = rect.left + rect.width / 2;
                            const dist = Math.abs(x - itemCenter);
                            if (dist > distance) return 1;
                            // Smooth magnification curve
                            return 1 + ((maxSize - baseSize) / baseSize) * (1 - dist / distance);
                        });

                    const iconClass = "flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100 shadow group-hover:bg-blue-100 transition-all duration-300";
                    const labelClass = "absolute -top-6 left-1/2 -translate-x-1/2 w-max whitespace-nowrap rounded bg-white border border-slate-300 px-2 py-0.5 text-xs text-slate-700 opacity-0 group-hover:opacity-100 group-hover:-translate-y-2 transition-all duration-200 pointer-events-none z-10";

                    if (item.isButton) {
                        return (
                            <motion.button
                                key={item.label}
                                ref={itemRef}
                                style={{ width: baseSize, height: baseSize, scale, originY: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                                onClick={item.onClick}
                                className="flex flex-col items-center relative group origin-bottom"
                            >
                                <span className={labelClass}>{item.label}</span>
                                <span className={iconClass}>
                                    {item.icon}
                                </span>
                            </motion.button>
                        );
                    }

                    return (
                        <motion.div
                            key={item.label}
                            ref={itemRef}
                            style={{ width: baseSize, height: baseSize, scale, originY: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 18 }}
                            className="flex flex-col items-center cursor-pointer select-none relative group origin-bottom"
                        >
                            <Link to={item.to} className="flex flex-col items-center group relative">
                                <span className={labelClass}>{item.label}</span>
                                <span className={iconClass + " relative"}>
                                    {item.icon}
                                    {item.label === "My Applications" && hasUnseen && (
                                        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full" />
                                    )}
                                </span>
                            </Link>
                        </motion.div>
                    );
                })}
            </motion.nav>
            <div id="container" className="pb-30">
                <Outlet />
            </div>
        </div>
    );
}
