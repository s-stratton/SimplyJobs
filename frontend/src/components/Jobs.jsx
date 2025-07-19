function Job({job, onDelete, hideDelete, onApply}) {
    return <div className="job-container">
        <p className="job-company">{job.company}</p>
        <p className="job-title">{job.title}</p>
        <p className="job-type">{job.job_type}</p>
        <p className="job-location">{job.location}</p>
        <p className="job-salary">€{job.salary}/hr</p>
        <p className="job-description">{job.description}</p>
        <p className="job-date">Posted on: {new Date(job.created_at).toLocaleDateString()}</p>
        {!hideDelete && (
            <button className="job-delete-button" onClick={() => onDelete(job.id)}>Delete</button>
        )}
        {onApply && (
            <button className="job-apply-button" onClick={() => onApply(job.id)}>Apply</button>
        )}
    </div>
}
export default Job;