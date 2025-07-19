import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import ApplicantStack from "../components/ApplicantStack";
import { FaAngleLeft, FaClone, FaList } from "react-icons/fa";

function Applicants() {
    const { jobId } = useParams();
    const [applicants, setApplicants] = useState([]);
    const [orderedApplicants, setOrderedApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("PENDING");
    const [view, setView] = useState("stack");
    const navigate = useNavigate();

    useEffect(() => {
        fetchApplicants();
    }, [jobId]);

    const fetchApplicants = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/jobs/${jobId}/applicants/`);
            setApplicants(res.data);
            setOrderedApplicants(prev =>
                prev.length === 0 ? res.data : prev
            );
        } catch (err) {
            alert("Failed to load applicants");
        } finally {
            setLoading(false);
        }
    };

    const refreshApplicants = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/jobs/${jobId}/applicants/`);
            setApplicants(res.data);
            setOrderedApplicants(res.data);
        } catch (err) {
            alert("Failed to load applicants");
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = (id) => {
        setOrderedApplicants(prev => {
            const idx = prev.findIndex(a => a.id === id);
            if (idx === -1) return prev;
            const newArr = [...prev];
            const [removed] = newArr.splice(idx, 1);
            newArr.unshift(removed);
            return newArr;
        });
    };

    const handleStatusChange = async (ids, newStatus) => {
        const idList = Array.isArray(ids) ? ids : [ids];
        setApplicants(prev =>
            prev.map(app =>
                idList.includes(app.id) ? { ...app, status: newStatus } : app
            )
        );
        setOrderedApplicants(prev =>
            prev.filter(app => !idList.includes(app.id))
        );
        try {
            await api.put("/api/applications/update/", {
                application_ids: idList,
                status: newStatus,
            });
            fetchApplicants();
        } catch (err) {
            alert("Failed to update status");
            fetchApplicants();
        }
    };

    const filteredApplicants = orderedApplicants.filter(
        app => app.status && app.status.toUpperCase() === statusFilter
    );

    return (
        <div className="px-4 py-8">
            <div className="flex items-center mb-8">
                <div className="flex-1 flex">
                    <button
                        className="mx-3 my-3 rounded-md text-xl text-slate-800 hover:cursor-pointer"
                        onClick={() => navigate(-1)}
                    >
                        <FaAngleLeft />
                    </button>
                </div>
                <h2 className="flex-1 text-3xl font-bold text-slate-800 text-center">
                    Applicants
                </h2>
                <div className="flex-1 flex justify-end">
                    <button
                        className="mx-3 my-3 rounded-md text-xl text-slate-800 hover:cursor-pointer"
                        onClick={() => setView(view === "stack" ? "list" : "stack")}
                    >
                        {view === "stack" ? <FaList /> : <FaClone />}
                    </button>
                </div>
            </div>

            <div className="flex justify-center gap-3 mb-6">
                {["PENDING", "SHORTLISTED", "REJECTED"].map(status => {
                    const count = applicants.filter(
                        a => a.status && a.status.toUpperCase() === status
                    ).length;
                    return (
                        <button
                            key={status}
                            onClick={() => {
                                setStatusFilter(status);
                                refreshApplicants();
                            }}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                                statusFilter === status
                                    ? status === "PENDING"
                                        ? "bg-blue-200 text-blue-700"
                                        : status === "SHORTLISTED"
                                        ? "bg-green-200 text-green-700"
                                        : "bg-red-200 text-red-700"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            {status} ({count})
                        </button>
                    );
                })}
            </div>
            {loading ? (
                <p className="font-semibold text-gray-500 flex flex-col items-center justify-center mt-60">
                    Loading...
                </p>
            ) : filteredApplicants.length === 0 ? (
                <p className="font-semibold text-gray-500 flex flex-col items-center justify-center mt-60">
                    No applicants yet
                </p>
            ) : (
                <ApplicantStack
                    applicants={filteredApplicants}
                    onStatusChange={handleStatusChange}
                    onSkipApplicant={handleSkip}
                    view={view}
                    setView={setView}
                    currentFilter={statusFilter}
                />
            )}
        </div>
    );
}

export default Applicants;
