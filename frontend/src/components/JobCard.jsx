export const JOB_CARD_WIDTH =
  window.innerWidth >= 768 ? 400 : 340;
export const JOB_CARD_HEIGHT =
  window.innerWidth >= 768 ? 600 : 520;

import { useState } from "react";
import { HiOutlineChevronDown, HiOutlineChevronUp } from "react-icons/hi";

function JobCard({ job, isTop, style, className, onExpand, forceShowFull }) {
  const [showFull, setShowFull] = useState(false);
  const hasLongDesc = job.description && job.description.length > 220;
  const showDescriptionFull = forceShowFull ? true : showFull;

  return (
    <div
      className={`rounded-2xl overflow-hidden border border-slate-200 bg-white ${isTop ? "shadow-lg" : "shadow-none"} flex flex-col ${className ? ` ${className}` : ""}`}
      style={{
        width: JOB_CARD_WIDTH,
        height: JOB_CARD_HEIGHT,
        ...style,
      }}
    >
      <div
        className="p-6 flex-1 flex flex-col"
        style={
          (showDescriptionFull || forceShowFull)
            ? {
                overflowY: 'scroll',
                WebkitOverflowScrolling: 'touch',
                height: '100%',
              }
            : undefined
        }
      >
        <div className="mb-2 flex items-center gap-2">
          <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded">{job.job_type || "Job Type"}</span>
          <span className="inline-block bg-slate-100 text-slate-600 text-xs font-medium px-2 py-0.5 rounded">{job.location || "Location"}</span>
        </div>
        <h3 className="font-bold text-2xl mb-1 text-slate-800">{job.title || "Job Title"}</h3>
        <p className="text-[#0A66C2] text-base mb-2 font-semibold">{job.company || "Company"}</p>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-slate-500 text-sm">Salary:</span>
          <span className="text-[#0A66C2] font-bold text-lg">
            {job.salary ? `€${job.salary}K/yr` : "€0K/yr"}
          </span>
        </div>
        <h2 className="text-xs font-semibold text-slate-500 uppercase mt-2 mb-1 tracking-wider">Description</h2>
        <p className={`text-slate-700 text-sm mb-4 whitespace-pre-line${!showDescriptionFull && hasLongDesc ? ' line-clamp-3' : ''}`}>
          {job.description || "Job description will appear here."}
        </p>
        {/* Show expand/collapse button only if description is long and not forced to show full */}
        {hasLongDesc && !forceShowFull && (
          onExpand ? (
            <button
              type="button"
              className="text-xs text-blue-600 hover:cursor-pointer mb-2 self-end flex items-center"
              onClick={() => onExpand(job)}
            >
              <HiOutlineChevronDown className="w-4 h-4 mr-1" />
              See more
            </button>
          ) : (
            <button
              type="button"
              className="text-xs text-blue-600 hover:cursor-pointer mb-2 self-end flex items-center"
              onClick={() => setShowFull(v => !v)}
            >
              {showFull ? <HiOutlineChevronUp className="w-4 h-4" /> : <HiOutlineChevronDown className="w-4 h-4 mr-1" />}
              {showFull ? "See less" : "See more"}
            </button>
          )
        )}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-100">
          <p className="text-slate-400 text-xs">
            Posted on: {job.created_at ? new Date(job.created_at).toLocaleDateString() : new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
export default JobCard;