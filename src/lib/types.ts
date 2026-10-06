/* ชนิดข้อมูลที่ owner-backend ส่งกลับมา */

export type PlanName = "FREE" | "GOLD" | "PLATINUM";
export type VerificationStatus = "not_submitted" | "pending" | "approved" | "rejected";
export type CompanyType = "private" | "government" | "state_enterprise";

export interface DocumentInfo {
  name: string;
  size: number;
  mimeType: string;
}

export interface CompanyProfile {
  id: string;
  slug: string;
  name: string;
  legalName: string;
  companyType: CompanyType;
  businessType: string;
  employeeCount: string | null;
  about: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  province: string;
  district: string | null;
  mapUrl: string | null;
  location: { lat: number; lng: number } | null;
  logoUrl: string | null;
  logoText: string;
  logoColor: string;
  coverImage: string | null;
  gallery: string[];
  registrationNumber: string | null;
  contactName: string | null;
  contactPosition: string | null;
  contactPhone: string | null;
  verificationStatus: VerificationStatus;
  verificationSubmittedAt: string | null;
  isPublic: boolean;
  plan: PlanName;
  planExpiresAt: string | null;
  memberUrl: string | null;
  documents: Record<"certificate" | "directorId" | "workplace" | "vat", DocumentInfo[]>;
}

export interface OwnerMe {
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
    provider: "LOCAL" | "GOOGLE";
    hasPassword: boolean;
  };
  company: CompanyProfile | null;
  plan: {
    current: PlanName;
    expiresAt: string | null;
    talentSearch: boolean;
    pendingPayment: { id: string; plan: PlanName; amount: number; createdAt: string } | null;
  };
}

/* ---------------- ประกาศงาน ---------------- */

export type JobStatus = "published" | "draft" | "closed";
export type WorkStyle = "onsite" | "hybrid" | "remote";
export type EmploymentType = "fulltime" | "contract" | "temporary" | "parttime" | "internship";
export type QuestionType = "single" | "date" | "short" | "multi" | "long";

export interface JobQuestion {
  id?: string;
  type: QuestionType;
  text: string;
  options: string[];
  required: boolean;
}

export interface JobListItem {
  id: string;
  slug: string;
  title: string;
  status: JobStatus;
  category: string;
  subcategory: string | null;
  department: string | null;
  workStyle: WorkStyle;
  employmentType: EmploymentType;
  experienceYears: number;
  openings: number;
  salaryMin: number;
  salaryMax: number;
  salaryNegotiable: boolean;
  isUrgent: boolean;
  province: string;
  postedAt: string;
  updatedAt: string;
  applicantCount: number;
  memberUrl: string | null;
  company: { name: string; businessType: string; logoUrl: string | null; logoText: string; logoColor: string };
}

export interface JobApplicant {
  applicationId: string;
  candidateId: string;
  code: string;
  name: string;
  avatarUrl: string | null;
  position: string | null;
  appliedAt: string;
  status: string;
  resumeScore: number | null;
  matchingScore: number;
}

export interface JobDetail extends JobListItem {
  description: string;
  skills: string[];
  benefits: string[];
  questions: Array<JobQuestion & { id: string }>;
  applicants: JobApplicant[];
}

export interface JobUsage {
  plan: PlanName;
  verified: boolean;
  lifetimePosts: number | null;
  postsUsed: number;
  maxActiveJobs: number | null;
  activeJobs: number;
  canPublish: boolean;
}

export interface JobList {
  items: JobListItem[];
  total: number;
  counts: Record<"all" | JobStatus, number>;
  usage: JobUsage;
}

export interface SaveJobPayload {
  title: string;
  category: string;
  subcategory?: string;
  department?: string;
  workStyle: WorkStyle;
  employmentType: EmploymentType;
  experienceYears: number;
  openings: number;
  salaryMin: number;
  salaryMax: number;
  salaryNegotiable: boolean;
  isUrgent: boolean;
  description: string;
  skills: string[];
  benefits: string[];
  questions: JobQuestion[];
  status: "draft" | "published";
}

/* ---------------- ผู้สมัคร ---------------- */

export type InvitationStatus = "sent" | "accepted" | "declined";

export interface CandidateSummary {
  id: string;
  code: string;
  name: string;
  avatarUrl: string | null;
  email: string;
  position: string | null;
  skills: string[];
  experienceYears: number;
  resumeScore: number | null;
  matchingScore: number | null;
  matchedJob: { id: string; title: string } | null;
  location: string | null;
  workplacePreference: string | null;
  expectedSalary: string | null;
  registeredAt: string;
  lastAppliedAt: string | null;
  appliedJobs: Array<{ id: string; title: string }>;
  isApplicant: boolean;
  isPublic: boolean;
  bookmarked: boolean;
  invitations: Array<{ jobId: string; status: "SENT" | "ACCEPTED" | "DECLINED" }>;
}

export interface CandidateList {
  items: CandidateSummary[];
  total: number;
  page: number;
  pageSize: number;
  skills: string[];
  talentSearch: boolean;
  plan: PlanName;
}

export interface MatchFactor {
  key: "skills" | "position" | "experience" | "salary";
  label: string;
  score: number;
  max: number;
  detail: string;
}

export interface MatchResult {
  score: number;
  job: { id: string; title: string };
  factors: MatchFactor[];
  explanation: string[];
}

export interface Answer {
  question: string;
  type: QuestionType;
  answer: string | string[];
}

export interface CandidateDetail extends CandidateSummary {
  resume: {
    contact: { name: string; email: string; phone: string | null; address: string | null };
    desiredPositions: string[];
    educations: Array<{ degree: string; major: string | null; institution: string; year: string | null; gpa: string | null }>;
    specialties: string[];
    languages: Array<{ name: string; level: string }>;
    workExperiences: Array<{ position: string; company: string; period: string; description: string | null }>;
    projects: string | null;
  };
  certificates: Array<{ title: string; issuer: string | null; fileName: string | null }>;
  match: MatchResult | null;
  applications: Array<{ id: string; job: { id: string; title: string }; status: string; appliedAt: string; answers: Answer[] }>;
  invitationHistory: Array<{ id: string; job: { id: string; title: string }; status: InvitationStatus; createdAt: string; respondedAt: string | null }>;
}

export interface InvitationItem {
  id: string;
  candidate: { id: string; code: string; name: string; avatarUrl: string | null };
  job: { id: string; title: string; deleted: boolean };
  status: InvitationStatus;
  message: string | null;
  createdAt: string;
  respondedAt: string | null;
}

export interface InvitationList {
  items: InvitationItem[];
  total: number;
  stats: { total: number; accepted: number; pending: number; declined: number };
}

export interface ResponseItem {
  applicationId: string;
  candidate: { id: string; code: string; name: string; avatarUrl: string | null; position: string | null; resumeScore: number | null };
  job: { id: string; title: string };
  appliedAt: string;
  answers: Answer[];
}

export interface ResponseList {
  items: ResponseItem[];
  total: number;
  jobs: Array<{ id: string; title: string }>;
}

/* ---------------- หน้าหลัก ---------------- */

export interface OwnerNotification {
  id: string;
  type: "application" | "invitation_accepted" | "invitation_declined";
  title: string;
  detail: string;
  createdAt: string;
  link: string;
}

export interface DashboardApplicant {
  applicationId: string;
  candidateId: string;
  name: string;
  avatarUrl: string | null;
  position: string | null;
  skills: string[];
  job: { id: string; title: string };
  appliedAt: string;
  resumeScore: number | null;
  matchingScore: number;
}

export interface Dashboard {
  company: { name: string; logoUrl: string | null; logoText: string; logoColor: string };
  plan: PlanName;
  talentSearch: boolean;
  verificationStatus: VerificationStatus;
  stats: {
    jobPosts: number;
    totalJobs: number;
    applicants: number;
    applicantsThisWeek: number;
    bookmarked: number;
    invites: number;
    invitesPending: number;
    invitesAccepted: number;
  };
  applicantsByPosition: Array<{
    job: { id: string; title: string; status: string };
    count: number;
    latestAt: string;
    applicants: DashboardApplicant[];
  }>;
  latestApplicants: DashboardApplicant[];
  notifications: OwnerNotification[];
}

/* ---------------- แพ็กเกจ ---------------- */

export interface Payment {
  id: string;
  plan: PlanName;
  planName: string;
  amount: number;
  method: "promptpay" | "bank_transfer";
  status: "pending" | "approved" | "rejected";
  proofName: string;
  createdAt: string;
  reviewedAt: string | null;
}

export interface Packages {
  plans: Array<{ plan: PlanName; name: string; price: number; period: string; features: string[]; recommended: boolean }>;
  current: { plan: PlanName; expiresAt: string | null };
  pendingPayment: Payment | null;
  payments: Payment[];
  paymentInfo: { promptPayId: string; bankName: string; accountName: string; accountNo: string };
}

export * from "./admin/types";

