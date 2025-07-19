import { useState, useEffect } from 'react';
import api from '../api';
import JobCard from '../components/JobCard';
import { Link } from 'react-router-dom';

function EmployerHome() {
    const [jobs, setJobs] = useState([]);

    useEffect(() => {
        getJobs();
    }, []);

    const getJobs = () => {
        api.get("/api/jobs/")
            .then((res) => res.data)
            .then((data) => setJobs(data))
            .catch((err) => alert(err));
    };

    // Delete job and refresh list
    const deleteJob = (id) => {
        api.delete(`/api/jobs/delete/${id}/`)
            .then((res) => {
                if (res.status === 204) alert("Job deleted successfully");
                else alert("Failed to delete job");
                getJobs();
            })
            .catch((err) => alert(err));
    };

    return (
        <div className="px-4 py-8">
            <h2 className="flex justify-center items-center text-3xl font-bold text-slate-800 mb-8">Your Jobs</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 justify-items-center">
                {jobs.length === 0 ? (
                    <div className="font-semibold col-span-full flex flex-col items-center justify-center text-center min-h-[60vh] text-slate-500">
                        No jobs yet. Create a job to get started!
                    </div>
                ) : (
                    jobs.map((job) => (
                        <div key={job.id} className="flex flex-col items-stretch">
                            <JobCard job={job} isTop={true} />
                            <div className="flex flex-row gap-4 mt-2">
                                <Link
                                    to={`/jobs/${job.id}/applicants`}
                                    className="text-blue-600 hover:underline text-sm"
                                >
                                    View Applicants
                                </Link>
                                <button
                                    onClick={() => deleteJob(job.id)}
                                    className="text-red-600 hover:underline text-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default EmployerHome;