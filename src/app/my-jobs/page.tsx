"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { MemberRouteGuard } from "@/components/member-route-guard";
import { PageHeading } from "@/components/page-heading";
import { getApplications, SAMPLE_JOBS, type JobApplication } from "@/lib/member-api";
import { useHiddenJobs } from "@/public-site/lib/useHiddenJobs";
import "./my-jobs.css";

/* ── Icons ──────────────────────────────────────────────────────── */

function IconBookmark({ filled }: { filled?: boolean }) {
  return filled ? (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
  );
}
function IconCheck() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>;
}
function IconCheckSimple() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>;
}
function IconClock() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
}
function IconChevron() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>;
}
function IconShare() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>;
}
function IconExternalLink() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4h6v6" /><path d="M20 4 10 14" /><path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" /></svg>;
}
function IconMapPin() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" /><circle cx="12" cy="10" r="3" /></svg>;
}
function IconBriefcase() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg>;
}
function IconDollar() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>;
}
function IconExperience() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>;
}
function IconUsers() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
}
function IconVerified() {
  return <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /><path d="M7.5 12.3l3 3 6-6.2" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function IconArrowLeft() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>;
}
function IconTrash() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m5 0V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>;
}
function IconSquare() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /></svg>;
}
function IconSquareCheck() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="m9 12 2 2 4-4" /></svg>;
}

/* ── Mock data ──────────────────────────────────────────────────── */

type MyJob = {
  id: string;
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

const SAVED_JOBS: MyJob[] = [
  {
    id: "job-001",
    title: "ERP Developer (Microsoft Dynamics AX)",
    company: "ABCDE Technology Co., Ltd",
    companyInitial: "A",
    location: "กรุงเทพมหานคร · พระราม 9",
    workMode: "Hybrid",
    salary: "฿30,000 - ฿50,000 บาท/เดือน",
    type: "Full-time",
    experience: "3-5 ปี",
    headcount: "1 อัตรา",
    deadlineDays: 13,
    description: "พัฒนาและปรับแต่งระบบ ERP บน Microsoft Dynamics AX ร่วมกับทีมธุรกิจเพื่อออกแบบโซลูชันที่เหมาะสมกับกระบวนการทางธุรกิจ รวมถึงการติดตั้ง ปรับแต่ง และดูแลระบบหลังการติดตั้ง",
    postedDate: "15 ส.ค. 2026",
    requirements: [
      "มีประสบการณ์พัฒนาระบบ Microsoft Dynamics AX อย่างน้อย 2 ปี",
      "เข้าใจกระบวนการทำงานของ ERP ในส่วน Finance, Supply Chain, HR",
      "สามารถเขียน X++ code และใช้ Tools ของ AX ได้",
      "มีความรู้ด้าน SQL Server และ Database Design",
      "สามารถสื่อสารกับผู้ใช้งานและวิเคราะห์ความต้องการได้",
    ],
    qualifications: [
      "จบการศึกษาสาขา Computer Science, IT หรือสาขาที่เกี่ยวข้อง",
      "มีใบรับรอง Microsoft Dynamics AX Certification เป็นข้อได้เปรียบ",
      "มีทักษะการสื่อสารภาษาอังกฤษในระดับดี",
      "สามารถทำงานเป็นทีมได้และมีความรับผิดชอบสูง",
    ],
    employerQuestions: [
      "คุณมีประสบการณ์ตรงกับ Microsoft Dynamics AX กี่ปี?",
      "คุณเคยดูแลระบบ ERP ในส่วนใดมาก่อน?",
      "คุณสะดวกเริ่มงานได้เมื่อไหร่?",
    ],
    benefits: [
      "ประกันสุขภาพและประกันอุบัติเหตุ",
      "โบนัสประจำปีตามผลประกอบการ",
      "วันหยุดพักร้อน 12 วัน/ปี",
      "อบรมและพัฒนาทักษะอย่างต่อเนื่อง",
      "เงินช่วยเหลือค่าเดินทาง",
    ],
  },
  {
    id: "job-002",
    title: "Senior Frontend Developer (React)",
    company: "TechVision Solutions Co., Ltd",
    companyInitial: "T",
    location: "Remote",
    workMode: "Remote",
    salary: "฿40,000 - ฿70,000 บาท/เดือน",
    type: "Full-time",
    experience: "4-6 ปี",
    headcount: "2 อัตรา",
    deadlineDays: 20,
    description: "ออกแบบและพัฒนาส่วนติดต่อผู้ใช้งานสำหรับเว็บแอปพลิเคชันระดับองค์กร ใช้ React, TypeScript และ Next.js ร่วมงานกับทีม UI/UX และ Backend แบบ Remote",
    postedDate: "12 ส.ค. 2026",
    requirements: [
      "มีประสบการณ์ React/Next.js อย่างน้อย 3 ปี",
      "เชี่ยวชาญ TypeScript และ Modern JavaScript",
      "เข้าใจ State Management (Redux, Zustand หรือ Recoil)",
      "มีประสบการณ์ทำ Responsive Design และ Cross-browser Compatibility",
      "คุ้นเคยกับ CI/CD Pipeline และ Git Workflow",
    ],
    qualifications: [
      "จบการศึกษาสาขาที่เกี่ยวข้องกับ IT หรือ Computer Science",
      "มี Portfolio/GitHub ที่แสดงผลงานได้",
      "สามารถทำงานได้อย่างอิสระแบบ Remote",
      "มีทักษะการสื่อสารภาษาอังกฤษ",
    ],
    employerQuestions: [
      "คุณมีประสบการณ์ React กี่ปี?",
      "คุณเคยทำงาน Remote เต็มเวลามาก่อนหรือไม่?",
    ],
    benefits: [
      "ทำงาน Remote 100%",
      "ประกันสุขภาพ",
      "โบนัสประจำปี",
      "MacBook Pro สำหรับใช้ทำงาน",
      "งบอบรมประจำปี 20,000 บาท",
    ],
  },
  {
    id: "job-003",
    title: "UX/UI Designer",
    company: "CreativeMinds Studio",
    companyInitial: "C",
    location: "เชียงใหม่ · นิมมาน",
    salary: "฿25,000 - ฿40,000 บาท/เดือน",
    type: "Full-time",
    experience: "2-4 ปี",
    headcount: "1 อัตรา",
    deadlineDays: 10,
    description: "ออกแบบประสบการณ์ผู้ใช้งานและส่วนติดต่อผู้ใช้งานสำหรับแอปพลิเคชันมือถือและเว็บไซต์ ตั้งแต่การวิจัยผู้ใช้งาน Wireframe ไปจนถึง Prototype และ Design System",
    postedDate: "10 ส.ค. 2026",
    requirements: [
      "ใช้ Figma ได้อย่างชำนาญ",
      "มีประสบการณ์ออกแบบ Mobile App และ Web Application",
      "เข้าใจหลัก UX Research และ Usability Testing",
      "สามารถสร้าง Design System และ Style Guide ได้",
      "มีทักษะในการนำเสนองานให้กับ Stakeholder",
    ],
    qualifications: [
      "จบการศึกษาสาขา Graphic Design, Industrial Design, หรือสาขาที่เกี่ยวข้อง",
      "มี Portfolio ผลงานออกแบบอย่างน้อย 5 ชิ้น",
      "มีความคิดสร้างสรรค์และใส่ใจในรายละเอียด",
    ],
    employerQuestions: [
      "ขอดู Portfolio การออกแบบล่าสุดของคุณ",
      "คุณถนัดออกแบบ Mobile หรือ Web มากกว่ากัน?",
    ],
    benefits: [
      "โบนัสประจำปี",
      "วันหยุดพักร้อน 10 วัน/ปี",
      "ประกันสุขภาพ",
      "บรรยากาศการทำงานแบบ Creative",
      "กิจกรรม Team Building ทุกเดือน",
    ],
  },
  {
    id: "job-004",
    title: "DevOps Engineer",
    company: "CloudPeak Infrastructure",
    companyInitial: "C",
    location: "กรุงเทพมหานคร · สีลม",
    workMode: "Hybrid",
    salary: "฿45,000 - ฿65,000 บาท/เดือน",
    type: "Full-time",
    experience: "3-5 ปี",
    headcount: "2 อัตรา",
    deadlineDays: 25,
    description: "ดูแลและบริหารจัดการระบบ Infrastructure บน Cloud, ออกแบบ CI/CD Pipeline, ใช้ Docker, Kubernetes และ Terraform ในการจัดการระบบ Production",
    postedDate: "8 ส.ค. 2026",
    requirements: [
      "มีประสบการณ์ใช้ AWS หรือ GCP อย่างน้อย 2 ปี",
      "เชี่ยวชาญ Docker และ Kubernetes",
      "เข้าใจ Infrastructure as Code (Terraform, CloudFormation)",
      "มีประสบการณ์ตั้งค่า CI/CD (Jenkins, GitHub Actions, GitLab CI)",
      "สามารถแก้ไขปัญหา Monitoring, Logging และ Alerting ได้",
    ],
    qualifications: [
      "จบการศึกษาสาขา IT, Computer Science หรือสาขาที่เกี่ยวข้อง",
      "มีใบรับรอง AWS/GCP Certification เป็นข้อได้เปรียบ",
      "มีทักษะ Scripting (Bash, Python)",
    ],
    employerQuestions: [
      "คุณมีประสบการณ์ใช้ Kubernetes ในระบบ Production หรือไม่?",
      "คุณเคยตั้งค่า CI/CD Pipeline ด้วยเครื่องมือใดบ้าง?",
    ],
    benefits: [
      "ประกันสุขภาพและประกันชีวิต",
      "โบนัสประจำปีสูงสุด 4 เดือน",
      "เงินเดือนปรับทุก 6 เดือน",
      "ทำงาน Hybrid (3 วัน Office / 2 วัน Remote)",
      "งบอบรมและ Certification ไม่จำกัด",
    ],
  },
  {
    id: "job-005",
    title: "Mobile Developer (React Native)",
    company: "AppVerse Co., Ltd",
    companyInitial: "A",
    location: "ภูเก็ต",
    salary: "฿30,000 - ฿50,000 บาท/เดือน",
    type: "Full-time",
    experience: "2-4 ปี",
    headcount: "1 อัตรา",
    deadlineDays: 18,
    description: "พัฒนาแอปพลิเคชันมือถือข้ามแพลตฟอร์มด้วย React Native เชื่อมต่อกับ REST API และ GraphQL ดูแลตั้งแต่ขั้นตอน Design จนถึง Deploy บน App Store และ Google Play",
    postedDate: "5 ส.ค. 2026",
    requirements: [
      "มีประสบการณ์ React Native อย่างน้อย 1 ปี",
      "เข้าใจ Native Module (iOS/Android) พื้นฐาน",
      "เคย publishes แอปบน App Store หรือ Google Play อย่างน้อย 1 แอป",
      "ใช้ TypeScript ได้",
      "เข้าใจ REST API และ State Management",
    ],
    qualifications: [
      "จบการศึกษาสาขา IT, Computer Science หรือสาขาที่เกี่ยวข้อง",
      "มี Portfolio แอปพลิเคชันที่เคยพัฒนา",
      "มีทักษะการทำงานเป็นทีม",
    ],
    employerQuestions: [
      "คุณเคย publish แอปบน Store ใดมาบ้าง?",
      "คุณสะดวกทำงานที่ภูเก็ตหรือไม่?",
    ],
    benefits: [
      "ทำงานริมทะเล บรรยากาศดี",
      "ประกันสุขภาพ",
      "โบนัสประจำปี",
      "วันหยุดพักร้อน 15 วัน/ปี",
      "Flex Time .work-life balance",
    ],
  },
  {
    id: "job-006",
    title: "Data Analyst",
    company: "Insight Analytics Co., Ltd",
    companyInitial: "I",
    location: "กรุงเทพมหานคร · สาทร",
    workMode: "Hybrid",
    salary: "฿28,000 - ฿42,000 บาท/เดือน",
    type: "Full-time",
    experience: "1-3 ปี",
    headcount: "3 อัตรา",
    deadlineDays: 15,
    description: "วิเคราะห์ข้อมูลธุรกิจ สร้าง Report และ Dashboard ด้วย SQL, Python และ BI Tools เพื่อสนับสนุนการตัดสินใจของฝ่ายบริหาร",
    postedDate: "3 ส.ค. 2026",
    requirements: [
      "เชี่ยวชาญ SQL ในการ query ข้อมูลจาก Database ขนาดใหญ่",
      "มีประสบการณ์ใช้ BI Tools เช่น Power BI, Tableau หรือ Looker",
      "ใช้ Python หรือ R ในการวิเคราะห์ข้อมูลได้",
      "เข้าใจ Data Modeling พื้นฐาน",
      "มีทักษะการนำเสนอข้อมูลให้เข้าใจง่าย",
    ],
    qualifications: [
      "จบการศึกษาสาขา Statistics, Mathematics, Computer Science หรือสาขาที่เกี่ยวข้อง",
      "มีประสบการณ์ทำงานด้าน Data Analysis อย่างน้อย 1 ปี",
      "มีทักษะการสื่อสารภาษาอังกฤษ",
    ],
    employerQuestions: [
      "คุณถนัด BI Tool ตัวไหนมากที่สุด?",
      "คุณเคยทำ Dashboard สำหรับผู้บริหารมาก่อนหรือไม่?",
    ],
    benefits: [
      "ประกันสุขภาพ",
      "โบนัสประจำปี",
      "วันหยุดพักร้อน 12 วัน/ปี",
      "อบรม Data Certification",
      "ใกล้ BTS สาทร เดินทางสะดวก",
    ],
  },
];

/* ── API applied jobs ────────────────────────────────────────────── */

const API_STATUS_MAP: Record<string, AppliedStatus> = {
  draft: "กรอกใบสมัคร",
  submitted: "รอพิจารณา",
};

function mapApplicationToAppliedJob(app: JobApplication): AppliedJob {
  const job = SAMPLE_JOBS.find((j) => j.id === app.jobId);
  const status = API_STATUS_MAP[app.status] ?? "รอพิจารณา";
  return {
    id: app.id,
    title: app.jobTitle,
    company: app.companyName,
    companyInitial: app.companyName.substring(0, 2).toUpperCase(),
    location: job?.location ?? "ไม่ระบุ",
    workMode: job?.workMode,
    salary: job?.salary ?? "ไม่ระบุ",
    type: job?.type ?? "Full-time",
    experience: "ไม่ระบุ",
    headcount: job?.headcount ?? "ไม่ระบุ",
    deadlineDays: job?.deadlineDays ?? 0,
    description: job?.description ?? "",
    postedDate: new Date(app.createdAt).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" }),
    requirements: job?.description ? [job.description] : [],
    qualifications: [],
    employerQuestions: [],
    benefits: [],
    status,
    appliedDate: new Date(app.createdAt).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" }),
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

/* ── Main Page ──────────────────────────────────────────────────── */

export default function MyJobsPage() {
  return (
    <MemberRouteGuard>
      <MyJobsContent />
    </MemberRouteGuard>
  );
}

function MyJobsContent() {
  const [activeTab, setActiveTab] = useState<"saved" | "applied" | "hidden">("saved");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(SAVED_JOBS[0].id);
  const [bookmarks, setBookmarks] = useState<Set<string>>(
    () => new Set(SAVED_JOBS.map((j) => j.id))
  );
  const { hiddenIds, unhideJob, unhideAll } = useHiddenJobs();
  const [sortBy, setSortBy] = useState("latest");
  const [page, setPage] = useState(1);
  const [mobileDetail, setMobileDetail] = useState(false);
  const [appliedFilter, setAppliedFilter] = useState<AppliedStatus | "all" | "ผลการสมัคร">("all");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [savedJobs, setSavedJobs] = useState<MyJob[]>([...SAVED_JOBS]);
  const [appliedJobs, setAppliedJobs] = useState<AppliedJob[]>([]);
  const [appliedLoading, setAppliedLoading] = useState(false);

  // Measure the left column's real rendered height (header + cards +
  // pagination) so the right detail card can be set to match it
  // exactly — a plain CSS "stretch" can't do this reliably because
  // the right card's own content would otherwise grow the grid row.
  const leftColRef = useRef<HTMLDivElement>(null);
  const [detailHeight, setDetailHeight] = useState<number | null>(null);

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

  useEffect(() => {
    setAppliedLoading(true);
    getApplications()
      .then((apps) => setAppliedJobs(apps.map(mapApplicationToAppliedJob)))
      .catch(() => setAppliedJobs([]))
      .finally(() => setAppliedLoading(false));
  }, []);

  const filteredApplied = activeTab === "applied"
    ? appliedFilter === "all"
      ? appliedJobs
      : appliedFilter === "ผลการสมัคร"
        ? appliedJobs.filter((j) => j.status === "ผ่านการคัดเลือก" || j.status === "ไม่ผ่านการคัดเลือก")
        : appliedJobs.filter((j) => j.status === appliedFilter)
    : [];

  const sortedSaved = useMemo(() => {
    const list = [...savedJobs];
    if (sortBy === "salary-high") {
      list.sort((a, b) => parseSalaryMax(b.salary) - parseSalaryMax(a.salary));
    } else if (sortBy === "salary-low") {
      list.sort((a, b) => parseSalaryMax(a.salary) - parseSalaryMax(b.salary));
    }
    return list;
  }, [savedJobs, sortBy]);

  const hiddenJobsList = useMemo(() => {
    const list: MyJob[] = [];
    const seen = new Set<string>();
    for (const id of Array.from(hiddenIds)) {
      const found = savedJobs.find((j) => j.id === id) || SAMPLE_JOBS.find((j) => j.id === id);
      if (found && !seen.has(id)) {
        seen.add(id);
        if ("companyInitial" in found) {
          list.push(found as MyJob);
        } else {
          list.push({
            id: found.id,
            title: found.title,
            company: found.company,
            companyInitial: found.company.substring(0, 2).toUpperCase(),
            location: found.location,
            salary: found.salary,
            type: found.type,
            experience: "3-5 ปี",
            headcount: "1 อัตรา",
            deadlineDays: 15,
            description: found.description,
            postedDate: "เมื่อเร็วๆ นี้",
            requirements: [],
            qualifications: [],
            employerQuestions: [],
            benefits: [],
          });
        }
      }
    }
    return list;
  }, [hiddenIds, savedJobs]);

  const currentList = activeTab === "saved" ? sortedSaved : filteredApplied;
  const totalCount = currentList.length;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const paginatedList = currentList.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const selectedJob = activeTab === "saved"
    ? currentList.find((j) => j.id === selectedJobId) ?? currentList[0]
    : null;

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
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

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`ลบงานที่เลือก ${selectedIds.size} รายการ?`)) return;
    setSavedJobs((prev) => prev.filter((j) => !selectedIds.has(j.id)));
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
        <PageHeading className="mj-title" title="งานของฉัน" description="จัดการงานที่บันทึกและติดตามสถานะใบสมัครของคุณ" fallbackHref="/profile" />

        {/* ── Tab bar ── */}
        <div className="mj-tabs">
          <button
            className={`mj-tab ${activeTab === "saved" ? "active" : ""}`}
            onClick={() => { setActiveTab("saved"); setPage(1); setSelectedJobId(sortedSaved[0]?.id ?? null); setMobileDetail(false); exitSelectMode(); }}
          >
            <IconBookmark /> งานที่บันทึก
            <span className={`mj-tab-badge ${activeTab === "saved" ? "active" : ""}`}>{savedJobs.length}</span>
          </button>
          <button
            className={`mj-tab ${activeTab === "applied" ? "active" : ""}`}
            onClick={() => { setActiveTab("applied"); setPage(1); setSelectedJobId(null); setMobileDetail(false); setAppliedFilter("all"); }}
          >
            <IconCheck /> งานที่สมัครแล้ว
            <span className={`mj-tab-badge ${activeTab === "applied" ? "active" : ""}`}>{appliedJobs.length}</span>
          </button>
          <button
            className={`mj-tab ${activeTab === "hidden" ? "active" : ""}`}
            onClick={() => { setActiveTab("hidden"); setPage(1); setSelectedJobId(null); setMobileDetail(false); exitSelectMode(); }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg> งานที่มุด
            <span className={`mj-tab-badge ${activeTab === "hidden" ? "active" : ""}`}>{hiddenIds.size}</span>
          </button>
        </div>

        {/* ── "applied" tab header (unchanged, full width — this tab has no 2-column layout) ── */}
        {activeTab === "applied" && (
          <div className="mj-applied-header">
            <div className="mj-applied-title-row">
              <span className="mj-applied-title">งานที่สมัคร <span className="mj-applied-count">({appliedJobs.length})</span></span>
              <div className="mj-filter-pills">
                {FILTER_OPTIONS.map((opt) => (
                  <button
                    key={opt.label}
                    className={`mj-filter-pill ${appliedFilter === opt.value ? "active" : ""}`}
                    onClick={() => { setAppliedFilter(opt.value); setPage(1); setSelectedJobId(null); }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Content ── */}
        {activeTab === "saved" ? (
          <div className={`mj-columns ${mobileDetail ? "show-detail" : ""}`}>
            {/* Left column wrap: header (scoped to this column's width) + scrollable list */}
            <div className="mj-list-wrap" ref={leftColRef}>
              <div className="mj-list-header">
                <span className="mj-list-title">
                  งานที่ปักหมุด{" "}
                  <span className="mj-list-count">({totalCount})</span>
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
                        aria-label="ลบรายการที่เลือก"
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
                    className={`mj-job-card ${selectedJobId === job.id && !selectMode ? "selected" : ""} ${selectedIds.has(job.id) ? "mj-card-checked" : ""}`}
                    onClick={() => selectMode ? toggleSelectJob(job.id) : handleSelectJob(job.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectMode ? toggleSelectJob(job.id) : handleSelectJob(job.id); } }}
                  >
                    <div className="mj-card-top">
                      {selectMode && (
                        <span className="mj-card-checkbox">
                          {selectedIds.has(job.id) ? <IconSquareCheck /> : <IconSquare />}
                        </span>
                      )}
                      <div className="mj-card-logo" style={{ background: getLogoColor(job.companyInitial) }}>{job.companyInitial}</div>
                      <div className="mj-card-info">
                        <h3 className="mj-card-title">{job.title}</h3>
                      </div>
                      {!selectMode && (
                        <button
                          className={`mj-bookmark-btn ${bookmarks.has(job.id) ? "active" : ""}`}
                          onClick={(e) => { e.stopPropagation(); toggleBookmark(job.id); }}
                          aria-label={bookmarks.has(job.id) ? "ยกเลิกบันทึก" : "บันทึกงาน"}
                        >
                          <IconBookmark filled={bookmarks.has(job.id)} />
                        </button>
                      )}
                    </div>
                    <p className="mj-card-company">{job.company}</p>
                    <p className="mj-card-location"><IconMapPin /> {job.location}</p>
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
                    <button className="mj-page-btn" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} aria-label="หน้าก่อนหน้า">‹</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                      <button key={n} className={`mj-page-num ${page === n ? "active" : ""}`} onClick={() => setPage(n)}>{n}</button>
                    ))}
                    <button className="mj-page-btn" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} aria-label="หน้าถัดไป">›</button>
                  </div>
                )}
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════
                Right column: job detail card
               ══════════════════════════════════════════════════════════ */}
            <div className="mj-detail-col">
              {selectedJob && !selectMode && (
                <div className="mj-detail-card" style={detailHeight ? { height: `${detailHeight}px`, maxHeight: "none" } : undefined}>
                  {/* Fixed header: only the cover image (never scrolls away) */}
                  <div className="mj-detail-header">
                    <div className="mj-detail-cover">
                      <div className="mj-detail-cover-bg" />
                    </div>
                  </div>

                  {/* Scrollable body: company row, title, info block, actions, and the long text sections */}
                  <div className="mj-detail-scroll">
                    <div className="mj-company-row">
                      <div className="mj-company-logo" style={{ background: getLogoColor(selectedJob.companyInitial) }}>{selectedJob.companyInitial}</div>
                    </div>

                    <h2 className="mj-detail-title">{selectedJob.title}</h2>

                    <div className="mj-company-line">
                      <span className="mj-company-name">{selectedJob.company}</span>
                      <span className="mj-verified-badge" title="บริษัทยืนยันแล้ว"><IconVerified /></span>
                      <a href="#" className="mj-view-details">View details <IconExternalLink /></a>
                    </div>

                    <div className="mj-detail-meta">
                      <span><IconMapPin /> {selectedJob.location}{selectedJob.workMode ? ` (${selectedJob.workMode})` : ""}</span>
                      <span><IconBriefcase /> {selectedJob.type}</span>
                      <span><IconExperience /> {selectedJob.experience}</span>
                      <span><IconDollar /> {selectedJob.salary}</span>
                      <span><IconUsers /> {selectedJob.headcount}</span>
                    </div>

                    <p className="mj-posted">โพสต์เมื่อ {selectedJob.postedDate}</p>

                    <div className="mj-detail-actions">
                      <Link href={`/apply-step1?jobId=${selectedJob.id}`} className="primary-button mj-apply-btn">สมัคร</Link>
                      <button className="mj-save-btn">
                        <IconBookmark filled={bookmarks.has(selectedJob.id)} /> บันทึก
                      </button>
                    </div>

                    <div className="mj-detail-divider" />

                    <div className="mj-detail-section">
                      <h3>Job Description</h3>
                      <p>{selectedJob.description}</p>
                    </div>
                    <div className="mj-detail-section">
                      <h3>Job Requirement</h3>
                      <ul>{selectedJob.requirements.map((r, i) => <li key={i}>{r}</li>)}</ul>
                    </div>
                    <div className="mj-detail-section">
                      <h3>คุณสมบัติเฉพาะ</h3>
                      <ul>{selectedJob.qualifications.map((q, i) => <li key={i}>{q}</li>)}</ul>
                    </div>
                    <div className="mj-detail-section">
                      <h3>คำถามจากผู้ประกอบการ</h3>
                      <ul>{selectedJob.employerQuestions.map((q, i) => <li key={i}>{q}</li>)}</ul>
                    </div>
                    <div className="mj-detail-section">
                      <h3>ผลตอบแทนและสวัสดิการ</h3>
                      <ul>{selectedJob.benefits.map((b, i) => <li key={i}>{b}</li>)}</ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mj-applied-list">
            {appliedLoading && <div className="mj-empty-state">กำลังโหลดข้อมูล...</div>}
            {!appliedLoading && paginatedList.length === 0 && <div className="mj-empty-state">ไม่มีงานในสถานะนี้</div>}
            {paginatedList.map((job) => {
              const aj = job as AppliedJob;
              return (
                <div key={job.id} className="mj-applied-card">
                  <div className="mj-applied-card-row">
                    <div className="mj-applied-logo" style={{ background: getLogoColor(job.companyInitial) }}>{job.companyInitial}</div>
                    <div className="mj-applied-info">
                      <span className="mj-applied-date">สมัครเมื่อ {aj.appliedDate}</span>
                      <h3 className="mj-applied-title-card">{job.title}</h3>
                      <p className="mj-applied-meta">{job.company} · {job.salary}</p>
                    </div>
                    <span className={`mj-status-badge ${STATUS_CLASSES[aj.status]}`}>{aj.status}</span>
                  </div>
                </div>
              );
            })}
            {totalPages > 1 && (
              <div className="mj-pagination">
                <button className="mj-page-btn" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} aria-label="หน้าก่อนหน้า">‹</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button key={n} className={`mj-page-num ${page === n ? "active" : ""}`} onClick={() => setPage(n)}>{n}</button>
                ))}
                <button className="mj-page-btn" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} aria-label="หน้าถัดไป">›</button>
              </div>
            )}
          </div>
        )}

        {/* ── "hidden" tab view (งานที่มุดไว้) ── */}
        {activeTab === "hidden" && (
          <div className="mj-applied-list">
            <div className="mj-applied-header" style={{ marginBottom: "20px" }}>
              <div className="mj-applied-title-row">
                <span className="mj-applied-title">
                  งานที่มุดไว้ <span className="mj-applied-count">({hiddenJobsList.length})</span>
                </span>
                {hiddenJobsList.length > 0 && (
                  <button
                    type="button"
                    onClick={unhideAll}
                    className="mj-filter-pill"
                    style={{ marginLeft: "auto", color: "var(--blue)" }}
                  >
                    ยกเลิกการมุดทั้งหมด
                  </button>
                )}
              </div>
            </div>

            {hiddenJobsList.length === 0 ? (
              <div className="mj-empty-state" style={{ textAlign: "center", padding: "48px 20px" }}>
                <p style={{ color: "#64748b", fontSize: "15px" }}>คุณยังไม่ได้มุดงานใดๆ</p>
                <p style={{ color: "#94a3b8", fontSize: "13px", marginTop: "6px" }}>คุณสามารถกดปุ่ม &quot;มุด&quot; บนการ์ดงานในหน้าค้นหาเพื่อซ่อนงานที่ไม่สนใจได้</p>
                <Link href="/jobs" className="primary-button" style={{ marginTop: "20px", display: "inline-flex" }}>
                  ไปที่หน้าค้นหางาน
                </Link>
              </div>
            ) : (
              hiddenJobsList.map((job) => (
                <div key={job.id} className="mj-applied-card">
                  <div className="mj-applied-card-row">
                    <div className="mj-applied-logo" style={{ background: getLogoColor(job.companyInitial) }}>
                      {job.companyInitial}
                    </div>
                    <div className="mj-applied-info">
                      <h3 className="mj-applied-title-card">{job.title}</h3>
                      <p className="mj-applied-meta">{job.company} · {job.salary}</p>
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
                      ยกเลิกการมุด
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

function parseSalaryMax(salary: string): number {
  const nums = salary.replace(/[^0-9]/g, " ").trim().split(/\s+/).map(Number);
  return nums.length > 1 ? nums[1] : (nums[0] || 0);
}
