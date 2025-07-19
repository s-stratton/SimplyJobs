import { useEffect, useState } from "react";
import api from "../api";
import JobCard from "../components/JobCard";

function AppliedJobs() {
    const [jobs, setJobs] = useState([]);
    const [confirmWithdrawId, setConfirmWithdrawId] = useState(null);

    useEffect(() => {
        getApplications();
    }, []);

    const getApplications = () => {
        api.get("/api/applied/")
            .then(res => setJobs(res.data))
            .catch(() => alert("Failed to load applied jobs"));
    };

    const deleteApplication = (id) => {
        api.delete(`/api/applied/delete/${id}/`)
            .then((res) => {
                if (res.status !== 204) alert("Failed to delete application");
                getApplications();
            })
            .catch((err) => alert(err));
    };

    return (
        <div className="px-4 py-8">
            <h2 className="flex justify-center items-center text-3xl font-bold text-slate-800 mb-8">
                Your Applications
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 justify-items-center min-h-[60vh]">
                {jobs.length === 0 && (
                    <div className="flex flex-col justify-center items-center col-span-full h-full">
                        <span className="text-slate-500 text-center">
                            You haven't applied to any jobs yet.
                        </span>
                    </div>
                )}
                {jobs.map(app => (
                    <div key={app.id} className="flex flex-col items-stretch">
                        <JobCard job={app.job} isTop={true} />
                        <div className="flex items-center gap-4 mt-2">
                            <span
                                className={`text-sm font-semibold px-2 py-1 rounded 
                                    ${
                                        app.status === "SHORTLISTED"
                                            ? "bg-green-100 text-green-700"
                                            : app.status === "REJECTED"
                                            ? "bg-red-100 text-red-700"
                                            : "bg-gray-100 text-gray-700"
                                    }
                                `}
                            >
                                {app.status
                                    ? app.status.charAt(0) + app.status.slice(1).toLowerCase()
                                    : "Pending"}
                            </span>
                            <button
                                onClick={() => setConfirmWithdrawId(app.id)}
                                className="text-red-600 hover:underline text-sm"
                            >
                                Withdraw Application
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {confirmWithdrawId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10">
                    <div className="bg-white rounded-xl shadow-2xl p-6 max-w-xs w-full">
                        <h3 className="text-lg font-semibold mb-2">Withdraw Application?</h3>
                        <p className="mb-4 text-gray-600">
                            Are you sure you want to withdraw your application?
                        </p>
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setConfirmWithdrawId(null)}
                                className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    deleteApplication(confirmWithdrawId);
                                    setConfirmWithdrawId(null);
                                }}
                                className="px-4 py-2 rounded bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800"
                            >
                                Withdraw
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AppliedJobs;