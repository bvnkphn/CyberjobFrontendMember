"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { MemberRouteGuard } from "@/components/member-route-guard";
import { PageHeading } from "@/components/page-heading";
import { getApplications, type JobApplication } from "@/lib/member-api";
import { useHiddenJobs } from "@/public-site/lib/useHiddenJobs";
import { useBookmarks } from "@/public-site/lib/bookmarks";
import { meService } from "@/public-site/services/auth.service";
import { jobsService } from "@/public-site/services/jobs.service";
import type { Job } from "@cyberjob/shared";
import "./my-jobs.css";

/* ── Icons ──────────────────────────────────────────────────────── */

function IconBookmark({ filled }: { filled?: boolean }) {
  return filled ? (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
function IconClock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function IconExternalLink() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 4h6v6" />
      <path d="M20 4 10 14" />
      <path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" />
    </svg>
  );
}
function IconMapPin() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function IconBriefcase() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    </svg>
  );
}
function IconDollar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}
function IconExperience() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function IconVerified() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="10" />
      <path d="M7.5 12.3l3 3 6-6.2" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconArrowLeft() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}
function IconTrash() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m5 0V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}
function IconSquare() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  );
}
function IconSquareCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
function IconEyeOff() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

/* ── Type definitions ───────────────────────────────────────────── */

type MyJob = {
  id: string;
  slug?: string;
  title: string;
  company: string;
  companyInitial: string;
  location: string;
  workMode?: string;
  salary: string;
  type: string;
  experience: string;
  headcount: string;
  deadlineDays: number;
  description: string;
  postedDate: string;
  requirements: string[];
  qualifications: string[];
  employerQuestions: string[];
  benefits: string[];
};

type AppliedStatus = "รอพิจารณา" | "ผ่านการคัดเลือก" | "ไม่ผ่านการคัดเลือก" | "นัดสัมภาษณ์" | "กรอกใบสมัคร";

type AppliedJob = MyJob & {
  status: AppliedStatus;
  appliedDate: string;
};

function mapJobToMyJob(job: Job): MyJob {
  const companyName = job.company?.name || "ไม่ระบุบริษัท";
  const initials =
    companyName
      .split(" ")
      .map((w) => w[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || companyName.substring(0, 2).toUpperCase() || "CJ";

  const salaryText = job.salaryNegotiable
    ? "ตามตกลง"
    : job.salaryMin && job.salaryMax
      ? `฿${job.salaryMin.toLocaleString()} - ฿${job.salaryMax.toLocaleString()} บาท/เดือน`
      : "ไม่ระบุเงินเดือน";

  return {
    id: job.id,
    slug: job.slug,
    title: job.title,
    company: companyName,
    companyInitial: initials,
    location: `${job.province || "กรุงเทพมหานคร"}${job.district ? ` · ${job.district}` : ""}`,
    workMode: job.workStyle || "On-site",
    salary: salaryText,
    type: job.employmentType || "Full-time",
    experience: job.experienceLevel || "ไม่ระบุประสบการณ์",
    headcount: "1 อัตรา",
    deadlineDays: 30,
    description: job.description || job.summary || "ไม่มีรายละเอียดเพิ่มเติม",
    postedDate: job.postedAt
      ? new Date(job.postedAt).toLocaleDateString("th-TH", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "เมื่อเร็วๆ นี้",
    requirements: job.requirements && job.requirements.length > 0 ? job.requirements : [],
    qualifications: job.additionalQualifications && job.additionalQualifications.length > 0 ? job.additionalQualifications : [],
    employerQuestions: [],
    benefits: job.benefits && job.benefits.length > 0 ? job.benefits : [],
  };
}

function mapApplicationToAppliedJob(app: JobApplication): AppliedJob {
  const statusMap: Record<string, AppliedStatus> = {
    draft: "กรอกใบสมัคร",
    submitted: "รอพิจารณา",
    pending: "รอพิจารณา",
    reviewed: "รอพิจารณา",
    shortlisted: "ผ่านการคัดเลือก",
    interview: "นัดสัมภาษณ์",
    rejected: "ไม่ผ่านการคัดเลือก",
    hired: "ผ่านการคัดเลือก",
  };
  const status: AppliedStatus = statusMap[app.status] ?? "รอพิจารณา";
  const companyName = app.companyName || "ไม่ระบุบริษัท";
  const companyInitial = companyName.substring(0, 2).toUpperCase() || "CJ";

  return {
    id: app.id,
    title: app.jobTitle || "ตำแหน่งงาน",
    company: companyName,
    companyInitial,
    location: "กรุงเทพมหานคร",
    workMode: "On-site",
    salary: "ตามตกลง",
    type: "Full-time",
    experience: "ไม่ระบุ",
    headcount: "1 อัตรา",
    deadlineDays: 0,
    description: "",
    postedDate: app.createdAt
      ? new Date(app.createdAt).toLocaleDateString("th-TH", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "เมื่อเร็วๆ นี้",
    requirements: [],
    qualifications: [],
    employerQuestions: [],
    benefits: [],
    status,
    appliedDate: app.createdAt
      ? new Date(app.createdAt).toLocaleDateString("th-TH", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "เมื่อเร็วๆ นี้",
  };
}

const ITEMS_PER_PAGE = 4;

const STATUS_CLASSES: Record<AppliedStatus, string> = {
  "รอพิจารณา": "mj-status-pending",
  "ผ่านการคัดเลือก": "mj-status-passed",
  "ไม่ผ่านการคัดเลือก": "mj-status-failed",
  "นัดสัมภาษณ์": "mj-status-interview",
  "กรอกใบสมัคร": "mj-status-draft",
};

const FILTER_OPTIONS: { label: string; value: AppliedStatus | "all" | "ผลการสมัคร" }[] = [
  { label: "ทั้งหมด", value: "all" },
  { label: "รอพิจารณา", value: "รอพิจารณา" },
  { label: "นัดสัมภาษณ์", value: "นัดสัมภาษณ์" },
  { label: "ผลการสมัคร", value: "ผลการสมัคร" },
];

const LOGO_COLORS = [
  "#3479ed", "#e74c3c", "#27ae60", "#f39c12", "#8e44ad",
  "#1abc9c", "#e67e22", "#2980b9", "#c0392b", "#16a085",
];

function getLogoColor(initials: string): string {
  const charSum = initials.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  return LOGO_COLORS[charSum % LOGO_COLORS.length];
}

/* ── Main Page Component ────────────────────────────────────────── */

export default function MyJobsPage() {
  return (
    <MemberRouteGuard>
      <MyJobsContent />
    </MemberRouteGuard>
  );
}

function MyJobsContent() {
  const [activeTab, setActiveTab] = useState<"saved" | "applied" | "hidden">("saved");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const bookmarksHook = useBookmarks();
  const { hiddenIds, unhideJob, unhideAll } = useHiddenJobs();

  const [page, setPage] = useState(1);
  const [mobileDetail, setMobileDetail] = useState(false);
  const [appliedFilter, setAppliedFilter] = useState<AppliedStatus | "all" | "ผลการสมัคร">("all");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Real data from API
  const [savedJobs, setSavedJobs] = useState<MyJob[]>([]);
  const [savedLoading, setSavedLoading] = useState(true);
  const [appliedJobs, setAppliedJobs] = useState<AppliedJob[]>([]);
  const [appliedLoading, setAppliedLoading] = useState(false);

  const leftColRef = useRef<HTMLDivElement>(null);
  const [detailHeight, setDetailHeight] = useState<number | null>(null);

  // ResizeObserver for matching columns height
  useEffect(() => {
    const el = leftColRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDetailHeight(entry.contentRect.height);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Fetch real saved/bookmarked jobs from API
  useEffect(() => {
    let alive = true;
    setSavedLoading(true);

    async function loadSavedJobs() {
      try {
        // 1. Try real API meService.bookmarks()
        let realJobs: Job[] = [];
        try {
          realJobs = await meService.bookmarks();
        } catch {
          // Fallback if not logged in or endpoint unauthenticated
        }

        if (realJobs && realJobs.length > 0) {
          if (alive) {
            const mapped = realJobs.map(mapJobToMyJob);
            setSavedJobs(mapped);
            setSelectedJobId(mapped[0]?.id ?? null);
            setSavedLoading(false);
          }
          return;
        }

        // 2. If meService.bookmarks() is empty, check bookmarksHook IDs from localStorage
        const ids = bookmarksHook.ids;
        if (ids && ids.length > 0) {
          const fetched = await jobsService.findMany(ids);
          if (alive) {
            const mapped = fetched.map(mapJobToMyJob);
            setSavedJobs(mapped);
            setSelectedJobId(mapped[0]?.id ?? null);
            setSavedLoading(false);
          }
          return;
        }

        if (alive) {
          setSavedJobs([]);
          setSelectedJobId(null);
          setSavedLoading(false);
        }
      } catch (err) {
        console.error("Error loading real saved jobs:", err);
        if (alive) {
          setSavedJobs([]);
          setSelectedJobId(null);
          setSavedLoading(false);
        }
      }
    }

    loadSavedJobs();

    return () => {
      alive = false;
    };
  }, [bookmarksHook.ready, bookmarksHook.ids.length]);

  // Fetch real applied jobs from API
  useEffect(() => {
    setAppliedLoading(true);
    getApplications()
      .then((apps) => setAppliedJobs(apps.map(mapApplicationToAppliedJob)))
      .catch(() => setAppliedJobs([]))
      .finally(() => setAppliedLoading(false));
  }, []);

  const filteredApplied = useMemo(() => {
    if (activeTab !== "applied") return [];
    if (appliedFilter === "all") return appliedJobs;
    if (appliedFilter === "ผลการสมัคร") {
      return appliedJobs.filter((j) => j.status === "ผ่านการคัดเลือก" || j.status === "ไม่ผ่านการคัดเลือก");
    }
    return appliedJobs.filter((j) => j.status === appliedFilter);
  }, [activeTab, appliedFilter, appliedJobs]);

  const hiddenJobsList = useMemo(() => {
    const list: MyJob[] = [];
    const seen = new Set<string>();
    for (const id of Array.from(hiddenIds)) {
      const found = savedJobs.find((j) => j.id === id);
      if (found && !seen.has(id)) {
        seen.add(id);
        list.push(found);
      }
    }
    return list;
  }, [hiddenIds, savedJobs]);

  const currentList = activeTab === "saved" ? savedJobs : filteredApplied;
  const totalCount = currentList.length;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const paginatedList = currentList.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const selectedJob = activeTab === "saved"
    ? currentList.find((j) => j.id === selectedJobId) ?? currentList[0] ?? null
    : null;

  // Toggle/remove bookmark on real API
  const handleToggleBookmark = (id: string) => {
    bookmarksHook.toggle(id);
    // Remove from saved list immediately
    setSavedJobs((prev) => {
      const next = prev.filter((j) => j.id !== id);
      if (selectedJobId === id) {
        setSelectedJobId(next[0]?.id ?? null);
      }
      return next;
    });
  };

  const handleSelectJob = (id: string) => {
    setSelectedJobId(id);
    setMobileDetail(true);
  };

  const toggleSelectJob = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Batch delete from real API
  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`ลบงานที่เลือก ${selectedIds.size} รายการออกจากรายการบันทึก?`)) return;

    for (const id of Array.from(selectedIds)) {
      bookmarksHook.toggle(id);
    }
    setSavedJobs((prev) => {
      const next = prev.filter((j) => !selectedIds.has(j.id));
      if (selectedJobId && selectedIds.has(selectedJobId)) {
        setSelectedJobId(next[0]?.id ?? null);
      }
      return next;
    });
    setSelectedIds(new Set());
    setSelectMode(false);
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  return (
    <main className="mj-page">
      <div className="mj-layout member-page-container">
        <PageHeading
          className="mj-title"
          title="งานของฉัน"
          description="จัดการงานที่บันทึก (ปักหมุด) และติดตามสถานะใบสมัครของคุณผ่านระบบจริง"
          fallbackHref="/profile"
        />

        {/* ── Tab bar (งานบันทึก/ปักหมุด คืออันเดียวกัน) ── */}
        <div className="mj-tabs">
          <button
            className={`mj-tab ${activeTab === "saved" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("saved");
              setPage(1);
              setSelectedJobId(savedJobs[0]?.id ?? null);
              setMobileDetail(false);
              exitSelectMode();
            }}
          >
            <IconBookmark filled={activeTab === "saved"} /> งานที่บันทึก (ปักหมุด)
            <span className={`mj-tab-badge ${activeTab === "saved" ? "active" : ""}`}>
              {savedLoading ? "..." : savedJobs.length}
            </span>
          </button>
          <button
            className={`mj-tab ${activeTab === "applied" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("applied");
              setPage(1);
              setSelectedJobId(null);
              setMobileDetail(false);
              setAppliedFilter("all");
            }}
          >
            <IconCheck /> งานที่สมัครแล้ว
            <span className={`mj-tab-badge ${activeTab === "applied" ? "active" : ""}`}>
              {appliedLoading ? "..." : appliedJobs.length}
            </span>
          </button>
          {hiddenIds.size > 0 && (
            <button
              className={`mj-tab ${activeTab === "hidden" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("hidden");
                setPage(1);
                setSelectedJobId(null);
                setMobileDetail(false);
                exitSelectMode();
              }}
            >
              <IconEyeOff /> งานที่ซ่อน
              <span className={`mj-tab-badge ${activeTab === "hidden" ? "active" : ""}`}>
                {hiddenIds.size}
              </span>
            </button>
          )}
        </div>

        {/* ── "applied" tab filter header ── */}
        {activeTab === "applied" && (
          <div className="mj-applied-header">
            <div className="mj-applied-title-row">
              <span className="mj-applied-title">
                งานที่สมัคร <span className="mj-applied-count">({appliedJobs.length})</span>
              </span>
              <div className="mj-filter-pills">
                {FILTER_OPTIONS.map((opt) => (
                  <button
                    key={opt.label}
                    className={`mj-filter-pill ${appliedFilter === opt.value ? "active" : ""}`}
                    onClick={() => {
                      setAppliedFilter(opt.value);
                      setPage(1);
                      setSelectedJobId(null);
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Content Area ── */}
        {activeTab === "saved" ? (
          savedLoading ? (
            <div className="mt-8 rounded-2xl border border-blue-100 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
              <p className="mt-4 text-sm font-medium text-slate-500">กำลังดึงข้อมูลงานที่บันทึกไว้จากระบบ...</p>
            </div>
          ) : savedJobs.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-blue-100 bg-white p-12 text-center shadow-sm sm:p-16">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-brand-600 shadow-sm">
                <IconBookmark filled />
              </div>
              <h3 className="mt-4 text-xl font-bold text-brand-900">ยังไม่มีงานที่บันทึกไว้</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
                คุณยังไม่ได้ปักหมุดบันทึกงานใดๆ สามารถค้นหาตำแหน่งงานคุณภาพที่เปิดรับสมัคร แล้วกดไอคอนปักหมุดเพื่อบันทึกงานไว้ดูภายหลังได้
              </p>
              <div className="mt-6 flex justify-center">
                <Link href="/jobs" className="btn-brand">
                  ค้นหาตำแหน่งงานทั้งหมด
                </Link>
              </div>
            </div>
          ) : (
            <div className={`mj-columns ${mobileDetail ? "show-detail" : ""}`}>
              {/* Left Column: list */}
              <div className="mj-list-wrap" ref={leftColRef}>
                <div className="mj-list-header">
                  <span className="mj-list-title">
                    งานที่บันทึก (ปักหมุด) <span className="mj-list-count">({totalCount})</span>
                  </span>
                  <div className="mj-list-actions">
                    {selectMode ? (
                      <>
                        <button className="mj-select-toggle active" onClick={exitSelectMode}>
                          เลือก({selectedIds.size})
                        </button>
                        <button
                          className={`mj-trash-btn ${selectedIds.size > 0 ? "has-items" : ""}`}
                          onClick={handleDeleteSelected}
                          disabled={selectedIds.size === 0}
                          aria-label="ลบรายการที่เลือกออกจากบันทึก"
                          title="ลบรายการที่เลือกออกจากบันทึก"
                        >
                          <IconTrash />
                        </button>
                      </>
                    ) : (
                      <button className="mj-select-toggle" onClick={() => setSelectMode(true)}>
                        เลือก({selectedIds.size})
                      </button>
                    )}
                  </div>
                </div>

                <div className="mj-list-col">
                  {paginatedList.map((job) => (
                    <div
                      key={job.id}
                      className={`mj-job-card ${selectedJobId === job.id && !selectMode ? "selected" : ""} ${
                        selectedIds.has(job.id) ? "mj-card-checked" : ""
                      }`}
                      onClick={() => (selectMode ? toggleSelectJob(job.id) : handleSelectJob(job.id))}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          selectMode ? toggleSelectJob(job.id) : handleSelectJob(job.id);
                        }
                      }}
                    >
                      <div className="mj-card-top">
                        {selectMode && (
                          <span className="mj-card-checkbox">
                            {selectedIds.has(job.id) ? <IconSquareCheck /> : <IconSquare />}
                          </span>
                        )}
                        <div
                          className="mj-card-logo"
                          style={{ background: getLogoColor(job.companyInitial) }}
                        >
                          {job.companyInitial}
                        </div>
                        <div className="mj-card-info">
                          <h3 className="mj-card-title">{job.title}</h3>
                        </div>
                        {!selectMode && (
                          <button
                            className="mj-bookmark-btn active"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleBookmark(job.id);
                            }}
                            aria-label="ยกเลิกการบันทึกงานนี้"
                            title="ยกเลิกการบันทึกงานนี้"
                          >
                            <IconBookmark filled />
                          </button>
                        )}
                      </div>
                      <p className="mj-card-company">{job.company}</p>
                      <p className="mj-card-location">
                        <IconMapPin /> {job.location}
                      </p>
                      <p className="mj-card-salary">{job.salary}</p>
                      <p className="mj-card-desc">{job.description}</p>
                      <div className="mj-card-footer">
                        <IconClock />
                        <span>โพสต์เมื่อ {job.postedDate}</span>
                      </div>
                    </div>
                  ))}

                  {totalPages > 1 && (
                    <div className="mj-pagination">
                      <button
                        className="mj-page-btn"
                        disabled={page === 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        aria-label="หน้าก่อนหน้า"
                      >
                        ‹
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                        <button
                          key={n}
                          className={`mj-page-num ${page === n ? "active" : ""}`}
                          onClick={() => setPage(n)}
                        >
                          {n}
                        </button>
                      ))}
                      <button
                        className="mj-page-btn"
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        aria-label="หน้าถัดไป"
                      >
                        ›
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Job Detail */}
              <div className="mj-detail-col">
                {selectedJob && !selectMode && (
                  <div
                    className="mj-detail-card"
                    style={detailHeight ? { height: `${detailHeight}px`, maxHeight: "none" } : undefined}
                  >
                    <div className="mj-detail-header">
                      <div className="mj-detail-cover">
                        <div className="mj-detail-cover-bg" />
                      </div>
                    </div>

                    <div className="mj-detail-scroll">
                      <div className="mj-company-row">
                        <div
                          className="mj-company-logo"
                          style={{ background: getLogoColor(selectedJob.companyInitial) }}
                        >
                          {selectedJob.companyInitial}
                        </div>
                      </div>

                      <h2 className="mj-detail-title">{selectedJob.title}</h2>

                      <div className="mj-company-line">
                        <span className="mj-company-name">{selectedJob.company}</span>
                        <span className="mj-verified-badge" title="บริษัทยืนยันแล้ว">
                          <IconVerified />
                        </span>
                        <Link
                          href={`/jobs/${selectedJob.slug || selectedJob.id}`}
                          className="mj-view-details"
                        >
                          ดูประกาศเต็ม <IconExternalLink />
                        </Link>
                      </div>

                      <div className="mj-detail-meta">
                        <span>
                          <IconMapPin /> {selectedJob.location}
                          {selectedJob.workMode ? ` (${selectedJob.workMode})` : ""}
                        </span>
                        <span>
                          <IconBriefcase /> {selectedJob.type}
                        </span>
                        <span>
                          <IconExperience /> {selectedJob.experience}
                        </span>
                        <span>
                          <IconDollar /> {selectedJob.salary}
                        </span>
                        <span>
                          <IconUsers /> {selectedJob.headcount}
                        </span>
                      </div>

                      <p className="mj-posted">โพสต์เมื่อ {selectedJob.postedDate}</p>

                      <div className="mj-detail-actions">
                        <Link
                          href={`/apply-step1?jobId=${selectedJob.id}`}
                          className="primary-button mj-apply-btn"
                        >
                          สมัครงาน
                        </Link>
                        <button
                          className="mj-save-btn"
                          onClick={() => handleToggleBookmark(selectedJob.id)}
                          title="นำออกจากรายการบันทึก"
                        >
                          <IconBookmark filled /> บันทึกแล้ว
                        </button>
                      </div>

                      <div className="mj-detail-divider" />

                      <div className="mj-detail-section">
                        <h3>รายละเอียดงาน</h3>
                        <p>{selectedJob.description}</p>
                      </div>

                      {selectedJob.requirements.length > 0 && (
                        <div className="mj-detail-section">
                          <h3>คุณสมบัติผู้สมัคร</h3>
                          <ul>
                            {selectedJob.requirements.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedJob.qualifications.length > 0 && (
                        <div className="mj-detail-section">
                          <h3>คุณสมบัติเพิ่มเติม</h3>
                          <ul>
                            {selectedJob.qualifications.map((q, i) => (
                              <li key={i}>{q}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedJob.benefits.length > 0 && (
                        <div className="mj-detail-section">
                          <h3>สวัสดิการ</h3>
                          <ul>
                            {selectedJob.benefits.map((b, i) => (
                              <li key={i}>{b}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        ) : activeTab === "applied" ? (
          /* ── "applied" tab view ── */
          <div className="mj-applied-list">
            {appliedLoading && <div className="mj-empty-state">กำลังโหลดข้อมูลใบสมัคร...</div>}
            {!appliedLoading && paginatedList.length === 0 && (
              <div className="mj-empty-state">
                <p>ยังไม่มีประวัติการสมัครงานในสถานะนี้</p>
                <Link href="/jobs" className="primary-button" style={{ marginTop: "16px", display: "inline-flex" }}>
                  ค้นหาตำแหน่งงาน
                </Link>
              </div>
            )}
            {paginatedList.map((job) => {
              const aj = job as AppliedJob;
              return (
                <div key={job.id} className="mj-applied-card">
                  <div className="mj-applied-card-row">
                    <div
                      className="mj-applied-logo"
                      style={{ background: getLogoColor(job.companyInitial) }}
                    >
                      {job.companyInitial}
                    </div>
                    <div className="mj-applied-info">
                      <span className="mj-applied-date">สมัครเมื่อ {aj.appliedDate}</span>
                      <h3 className="mj-applied-title-card">{job.title}</h3>
                      <p className="mj-applied-meta">
                        {job.company} · {job.salary}
                      </p>
                    </div>
                    <span className={`mj-status-badge ${STATUS_CLASSES[aj.status]}`}>{aj.status}</span>
                  </div>
                </div>
              );
            })}
            {totalPages > 1 && (
              <div className="mj-pagination">
                <button
                  className="mj-page-btn"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-label="หน้าก่อนหน้า"
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    className={`mj-page-num ${page === n ? "active" : ""}`}
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </button>
                ))}
                <button
                  className="mj-page-btn"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  aria-label="หน้าถัดไป"
                >
                  ›
                </button>
              </div>
            )}
          </div>
        ) : (
          /* ── "hidden" tab view (งานที่ซ่อนไว้) ── */
          <div className="mj-applied-list">
            <div className="mj-applied-header" style={{ marginBottom: "20px" }}>
              <div className="mj-applied-title-row">
                <span className="mj-applied-title">
                  งานที่ซ่อนไว้ <span className="mj-applied-count">({hiddenJobsList.length})</span>
                </span>
                {hiddenJobsList.length > 0 && (
                  <button
                    type="button"
                    onClick={unhideAll}
                    className="mj-filter-pill"
                    style={{ marginLeft: "auto", color: "var(--blue)" }}
                  >
                    ยกเลิกการซ่อนทั้งหมด
                  </button>
                )}
              </div>
            </div>

            {hiddenJobsList.length === 0 ? (
              <div className="mj-empty-state" style={{ textAlign: "center", padding: "48px 20px" }}>
                <p style={{ color: "#64748b", fontSize: "15px" }}>คุณยังไม่ได้ซ่อนประกาศงานใดๆ</p>
                <p style={{ color: "#94a3b8", fontSize: "13px", marginTop: "6px" }}>
                  คุณสามารถกดปุ่ม &quot;ซ่อน&quot; บนการ์ดงานในหน้าค้นหา เพื่อซ่อนงานที่ไม่สนใจได้
                </p>
                <Link href="/jobs" className="primary-button" style={{ marginTop: "20px", display: "inline-flex" }}>
                  ไปที่หน้าค้นหางาน
                </Link>
              </div>
            ) : (
              hiddenJobsList.map((job) => (
                <div key={job.id} className="mj-applied-card">
                  <div className="mj-applied-card-row">
                    <div
                      className="mj-applied-logo"
                      style={{ background: getLogoColor(job.companyInitial) }}
                    >
                      {job.companyInitial}
                    </div>
                    <div className="mj-applied-info">
                      <h3 className="mj-applied-title-card">{job.title}</h3>
                      <p className="mj-applied-meta">
                        {job.company} · {job.salary}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => unhideJob(job.id)}
                      style={{
                        padding: "8px 18px",
                        borderRadius: "999px",
                        border: "1px solid #cbd5e1",
                        background: "#fff",
                        color: "#334155",
                        fontWeight: 600,
                        fontSize: "13px",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#3479ed";
                        e.currentTarget.style.color = "#3479ed";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#cbd5e1";
                        e.currentTarget.style.color = "#334155";
                      }}
                    >
                      ยกเลิกการซ่อน
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {mobileDetail && (
          <button className="mj-mobile-back" onClick={() => setMobileDetail(false)}>
            <IconArrowLeft /> กลับไปรายการงาน
          </button>
        )}
      </div>
    </main>
  );
}
