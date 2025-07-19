import { useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";
import { ACCESS_TOKEN } from "../constants";
import api from '../api';
import JobStack from '../components/JobStack';
import TutorialCard, { TutorialRotate } from '../components/TutorialCard';

function JobseekerHome() {
    const [jobs, setJobs] = useState([]);
    const [orderedJobs, setOrderedJobs] = useState([]);
    const [appliedJobIds, setAppliedJobIds] = useState([]);
    const [showTutorial, setShowTutorial] = useState(false);

    useEffect(() => {
        getJobs();
        getAppliedJobs();

        const token = localStorage.getItem(ACCESS_TOKEN);
        let username = null;
        let account = null;
        if (token) {
            try {
                const decoded = jwtDecode(token);
                username = decoded.username;
                account = decoded.account;
            } catch (e) {}
        }
        // Show tutorial if user is a jobseeker and hasn't seen it yet
        if (username && account === "JOBSEEKER") {
            api.get('/api/tutorial_seen/')
                .then(res => {
                    if (res.data && res.data.has_seen_tutorial === false) {
                        setShowTutorial(true);
                    }
                })
                .catch(() => {});
        }
    }, []);

    const getJobs = () => {
        api.get("/api/jobs/")
            .then((res) => res.data)
            .then((data) => {
                setJobs(data);
                setOrderedJobs(prev => prev.length === 0 ? data : prev);
            })
            .catch((err) => alert(err));
    };

    const getAppliedJobs = () => {
        api.get("/api/applied/")
            .then((res) => res.data)
            .then((data) => {
                setAppliedJobIds(data.map(app => typeof app.job === "object" ? app.job.id : app.job));
            })
            .catch((err) => alert(err));
    };

    const applyToJob = (jobId) => {
        api.post('/api/jobs/apply/', { job: jobId })
            .then(res => {
                if (res.status === 201) {
                    localStorage.setItem("hasUnseenApplications", "true");
                    window.dispatchEvent(new Event("hasUnseenApplications"));
                    getAppliedJobs();
                } else {
                    alert('Failed to apply.');
                }
            })
            .catch(err => {
                if (err.response && err.response.data) {
                    const data = err.response.data;
                    if (typeof data === 'string' && data.includes('already applied')) {
                        alert('You have already applied to this job.');
                    } else {
                        alert(JSON.stringify(data));
                    }
                } else {
                    alert(err);
                }
            });
    };

    const handleSkipJob = (jobId) => {
        setOrderedJobs(prev => {
            const idx = prev.findIndex(job => job.id === jobId);
            if (idx === -1) return prev;
            const newArr = [...prev];
            const [removed] = newArr.splice(idx, 1);
            newArr.unshift(removed);
            return newArr;
        });
    };

    const unappliedJobs = orderedJobs.filter(
        job => !appliedJobIds.includes(job.id)
    );

    const handleTutorialClose = () => {
        setShowTutorial(false);
        api.patch('/api/tutorial_seen/');
    };

    const [expandedJob, setExpandedJob] = useState(null);
    useEffect(() => {
        if (expandedJob) {
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = '';
            };
        } else {
            document.body.style.overflow = '';
        }
    }, [expandedJob]);

    const handleExpandJob = (job) => {
        setExpandedJob(job);
    };
    const handleCloseExpanded = () => {
        setExpandedJob(null);
    };

    return (
        <div className="px-4 py-8 relative">
            {showTutorial && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm">
                    <div style={{ perspective: 600 }} className="relative w-[340px] h-[520px]">
                        <TutorialRotate>
                            <TutorialCard
                                onClose={handleTutorialClose}
                                leftText="skip"
                                rightText="apply"
                            />
                        </TutorialRotate>
                    </div>
                </div>
            )}
            {expandedJob && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" style={{ touchAction: 'none' }}>
                    <div className="absolute inset-0" onClick={handleCloseExpanded} />
                    <div className="relative">
                        <JobStack
                            jobs={[expandedJob]}
                            onApply={applyToJob}
                            onExpand={null}
                            sendToBackOnClick={false}
                        />
                        <button
                            className="absolute top-3 right-3 text-slate-500 hover:text-slate-700 text-xl font-bold bg-white/80 rounded-full px-2 py-1"
                            onClick={handleCloseExpanded}
                            aria-label="Close"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}
            <h2 className="flex justify-center items-center text-3xl font-bold text-slate-800 mb-8 md:mb-40 lg:mb-8">Browse Jobs</h2>
            {unappliedJobs.length === 0 ? (
                <div className="font-semibold flex flex-col items-center justify-center min-h-[60vh] mt-8 text-slate-500">
                    No jobs available
                </div>
            ) : (
                <JobStack
                    jobs={unappliedJobs}
                    onApply={applyToJob}
                    onSkip={handleSkipJob}
                    onExpand={handleExpandJob}
                />
            )}
        </div>
    );
}

export default JobseekerHome;