import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import JobCard from '../components/JobCard';

function CreateJob() {
    const [company, setCompany] = useState("");
    const [job_type, setJobType] = useState("");
    const [location, setLocation] = useState("");
    const [salary, setSalary] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const navigate = useNavigate();

    // Handle job creation form submit
    const createJob = (e) => {
        e.preventDefault();
        setError("");
        setIsCreating(true);
        const jobData = { company, job_type, location, salary, title, description };
        api.post("/api/jobs/", jobData)
            .then((res) => {
                if (res.status === 201) {
                    navigate("/");
                } else {
                    setError("Failed to create job");
                }
            })
            .catch((err) => {
                if (err.response && err.response.data) {
                    setError(JSON.stringify(err.response.data));
                } else {
                    setError(String(err));
                }
            })
            .finally(() => setIsCreating(false));
    };

    return (
        <div className="px-4 py-8">
            <h2 className="flex justify-center items-center text-3xl font-bold text-slate-800 mb-8">Create Job</h2>
            <div className="from-slate-50 via-white to-slate-100 flex items-center justify-center px-4">
                <div className="flex flex-col md:flex-row gap-12 w-full max-w-5xl">
                    {/* Card Preview */}
                    <div className="flex-1 flex justify-center">
                        <JobCard
                            job={{
                                company,
                                job_type,
                                location,
                                salary,
                                title,
                                description,
                                created_at: new Date(),
                            }}
                        />
                    </div>
                    {/* Form */}
                    <div className="flex-1 bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
                        {error && (
                            <div className="mb-4 px-4 py-2 bg-red-100 text-red-700 rounded border border-red-300">
                                {error}
                            </div>
                        )}
                        <form onSubmit={createJob} className="space-y-4">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-slate-700">Title</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    required
                                    placeholder="e.g. Software Engineer"
                                    className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    onChange={e => setTitle(e.target.value)}
                                    value={title}
                                />
                            </div>
                            <div>
                                <label htmlFor="company" className="block text-sm font-medium text-slate-700">Company</label>
                                <input
                                    type="text"
                                    id="company"
                                    name="company"
                                    required
                                    placeholder="e.g. Simply Jobs"
                                    className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    onChange={e => setCompany(e.target.value)}
                                    value={company}
                                />
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-slate-700">Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    required
                                    rows={4}
                                    placeholder="Describe the job responsibilities, requirements, etc."
                                    className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    onChange={e => setDescription(e.target.value)}
                                    value={description}
                                ></textarea>
                            </div>
                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-slate-700">Location</label>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    required
                                    placeholder="e.g. Berlin, Germany"
                                    className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    onChange={e => setLocation(e.target.value)}
                                    value={location}
                                />
                            </div>
                            <div>
                                <label htmlFor="job_type" className="block text-sm font-medium text-slate-700">Job Type</label>
                                <input
                                    type="text"
                                    id="job_type"
                                    name="job_type"
                                    required
                                    placeholder="e.g. Full-Time, Part-Time"
                                    className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    onChange={e => setJobType(e.target.value)}
                                    value={job_type}
                                />
                            </div>
                            <div>
                                <label htmlFor="salary" className="block text-sm font-medium text-slate-700">Salary (€ / year)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    id="salary"
                                    name="salary"
                                    required
                                    placeholder="e.g. 50"
                                    className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    onWheel={e => e.target.blur()}
                                    onChange={e => setSalary(e.target.value)}
                                    value={salary}
                                />
                            </div>
                            <button
                                type="submit"
                                className={`w-full mt-4 bg-blue-500 text-white font-semibold py-2 rounded hover:bg-blue-600 transition-colors${isCreating ? ' opacity-70 cursor-not-allowed' : ''}`}
                                disabled={isCreating}
                            >
                                {isCreating ? 'Creating Job...' : 'Create Job'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreateJob;