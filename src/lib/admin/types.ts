export type CandidateSource = "CYBERPAY_INTERN" | "OUTSIDER";
export type ExperienceLevel = "NONE" | "ONE_TWO" | "THREE_FIVE" | "SIX_TEN" | "TEN_PLUS";

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AdminJob {
  id: string;
  companyName: string;
  title: string;
  experienceLevel: ExperienceLevel;
  experienceMinYears: number;
  salaryMin: number;
  salaryMax: number;
  salaryNegotiable: boolean;
  workStyle: string;
  isActive: boolean;
  isUrgent: boolean;
  postedAt: string;
}

export interface JobFilterOptions {
  experiences: { value: ExperienceLevel; minYears: number }[];
  titles: string[];
}

export interface AdminUser {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string | null;
  experienceYears: number;
  desiredPosition: string | null;
  source: CandidateSource;
  resumeScore: number | null;
  certificateCount: number;
  createdAt: string;
}

export interface UserStats {
  total: number;
  cyberpayIntern: { count: number; percent: number };
  outsider: { count: number; percent: number };
}

export interface UserDetail {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string | null;
  experienceYears: number;
  desiredPosition: string | null;
  source: CandidateSource;
}

export interface Resume {
  contact: { name: string; email: string; phone: string | null; address: string | null };
  desiredPositions: string[];
  educations: { degree: string; major: string | null; institution: string; year: string | null; gpa: string | null }[];
  specialties: string[];
  languages: { name: string; level: string }[];
  workExperiences: { position: string; company: string; period: string; description: string | null }[];
  projects: string | null;
}

export interface CertificateList {
  total: number;
  items: { title: string; issuer: string | null; fileName: string | null }[];
}
