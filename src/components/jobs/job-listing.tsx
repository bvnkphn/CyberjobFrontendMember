"use client";

import { useState } from "react";
import Link from "next/link";
import { SAMPLE_JOBS, type JobListing as JobListingType } from "@/lib/member-api";
import { ProfilePageHeading } from "../profile/profile-page-heading";
import "./job-listing.css";

export function JobListing() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");

  const filtered = SAMPLE_JOBS.filter((job) => {
    const matchSearch =
      search === "" ||
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase()) ||
      job.location.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || job.type === filterType;
    return matchSearch && matchType;
  });

  return (
    <main className="jobs-page">
      <div className="jobs-layout">
        <ProfilePageHeading
          title="ค้นหางาน"
          description="เลือกตำแหน่งที่เหมาะกับคุณ แล้วเริ่มสมัครงานได้เลย"
          fallbackHref="/"
        />

        <div className="jobs-toolbar">
          <div className="jobs-search">
            <input
              type="text"
              placeholder="ค้นหาตำแหน่ง, บริษัท, หรือสถานที่..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="ค้นหางาน"
            />
          </div>
          <select
            className="jobs-type-filter"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            aria-label="กรองตามประเภทงาน"
          >
            <option value="all">ทุกประเภท</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Freelance">Freelance</option>
          </select>
        </div>

        <p className="jobs-count">
          พบ {filtered.length} ตำแหน่งงาน
        </p>

        <div className="jobs-grid">
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
          {filtered.length === 0 && (
            <p className="jobs-empty">ไม่พบตำแหน่งงานที่ค้นหา</p>
          )}
        </div>
      </div>
    </main>
  );
}

function JobCard({ job }: { job: JobListingType }) {
  return (
    <article className="job-card">
      <div className="job-card-header">
        <div className="job-card-logo">
          {job.company.charAt(0)}
        </div>
        <div>
          <h3 className="job-card-title">{job.title}</h3>
          <p className="job-card-company">{job.company}</p>
        </div>
      </div>
      <p className="job-card-description">{job.description}</p>
      <div className="job-card-meta">
        <span className="job-card-tag">{job.type}</span>
        <span className="job-card-location">{job.location}</span>
        <span className="job-card-salary">{job.salary}</span>
      </div>
      <div className="job-card-actions">
        <Link href={`/apply-step1?jobId=${job.id}`} className="primary-button job-apply-button">
          สมัครงาน
        </Link>
      </div>
    </article>
  );
}
