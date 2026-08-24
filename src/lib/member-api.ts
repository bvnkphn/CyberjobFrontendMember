const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export class ApiError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}

function getAccessToken() {
  return typeof window === "undefined" ? null : window.localStorage.getItem("accessToken");
}

export function hasAccessToken() { return Boolean(getAccessToken()); }

type AuthSession = { accessToken: string; user: { id: string; email: string; isDemo: boolean } };

export async function ensureDemoSession() {
  if (typeof window === "undefined" || process.env.NODE_ENV !== "development" || getAccessToken() || window.sessionStorage.getItem("demoSessionDisabled") === "true") return null;
  window.localStorage.removeItem("demoSessionDisabled");
  const response = await fetch(`${API_URL}/auth/demo`, { method: "POST", headers: { "Content-Type": "application/json" } });
  if (!response.ok) return null;
  const session = await response.json() as AuthSession;
  window.localStorage.setItem("accessToken", session.accessToken);
  window.localStorage.setItem("memberEmail", session.user.email);
  return session;
}

export function logout() {
  window.localStorage.removeItem("accessToken");
  window.localStorage.removeItem("memberEmail");
  window.localStorage.removeItem("demoSessionDisabled");
  window.sessionStorage.setItem("demoSessionDisabled", "true");
}

export async function login(email: string, password: string) {
  const isDevelopmentDemo = process.env.NODE_ENV === "development" && email.trim().toLowerCase() === "user@test.com" && password === "usertest555";
  const response = await fetch(`${API_URL}${isDevelopmentDemo ? "/auth/demo" : "/auth/login"}`, { method: "POST", headers: { "Content-Type": "application/json" }, ...(isDevelopmentDemo ? {} : { body: JSON.stringify({ email, password }) }) });
  if (!response.ok) throw new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
  const session = await response.json() as AuthSession;
  window.localStorage.setItem("accessToken", session.accessToken);
  window.localStorage.setItem("memberEmail", session.user.email);
  window.sessionStorage.removeItem("demoSessionDisabled");
  return session;
}

type RegisterPayload = {
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  termsAccepted: boolean;
};

async function authRequest<T>(path: string, data: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { message?: string | string[] } | null;
    const message = Array.isArray(payload?.message) ? payload.message.join(", ") : payload?.message;
    throw new ApiError(message ?? "ไม่สามารถดำเนินการได้", response.status);
  }
  return response.json() as Promise<T>;
}

export function register(data: RegisterPayload) {
  return authRequest<{ message: string; email?: string }>("/auth/register", data);
}

export async function verifyOtp(email: string, otp: string) {
  const session = await authRequest<AuthSession>("/auth/verify-otp", { email, otp });
  window.localStorage.setItem("accessToken", session.accessToken);
  window.localStorage.setItem("memberEmail", session.user.email);
  window.sessionStorage.removeItem("demoSessionDisabled");
  return session;
}

export function resendOtp(email: string) {
  return authRequest<{ message: string }>("/auth/resend-otp", { email });
}

export function forgotPassword(email: string) {
  return authRequest<{ message: string }>("/auth/forgot-password", { email });
}

export function resetPassword(token: string, newPassword: string) {
  return authRequest<{ message: string }>("/auth/reset-password", { token, newPassword });
}

async function request<T>(path: string, init: RequestInit, retried = false): Promise<T> {
  if (!getAccessToken()) await ensureDemoSession();
  const token = getAccessToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  if (response.status === 401 && process.env.NODE_ENV === "development" && !retried && window.sessionStorage.getItem("demoSessionDisabled") !== "true") {
    window.localStorage.removeItem("accessToken");
    await ensureDemoSession();
    return request<T>(path, init, true);
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { message?: string | string[] } | null;
    const message = Array.isArray(payload?.message) ? payload.message.join(", ") : payload?.message;
    throw new ApiError(message ?? "ไม่สามารถเชื่อมต่อระบบได้", response.status);
  }
  return response.json() as Promise<T>;
}

export function formDataToObject(form: HTMLFormElement) {
  const result: Record<string, unknown> = {};
  for (const [key, value] of new FormData(form).entries()) {
    const normalized = value instanceof File ? { name: value.name, size: value.size, type: value.type } : value;
    const current = result[key];
    result[key] = current === undefined ? normalized : Array.isArray(current) ? [...current, normalized] : [current, normalized];
  }
  return result;
}

export function saveGate(data: Record<string, unknown>) {
  return request("/gate", { method: "POST", body: JSON.stringify(data) });
}

export function skipGate() {
  return request("/gate/skip", { method: "POST", body: JSON.stringify({ privacy: "private" }) });
}

export function saveProfileSection(section: string, data: Record<string, unknown>) {
  return request(`/profile/${section}`, { method: "PATCH", body: JSON.stringify({ data }) });
}

export type MemberProfile = {
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  completion: number;
  privacy: "public" | "private";
  updatedAt: string;
  address: string | null;
  desiredJobCategories: string[];
  personal: Record<string, unknown>;
  desiredJob: Record<string, unknown>;
  educations: Record<string, unknown> | unknown[];
  workExperiences: Record<string, unknown> | unknown[];
  certificates: Record<string, unknown> | unknown[];
  languages: Record<string, unknown> | unknown[];
  otherSkills: Record<string, unknown>;
};

export function getProfile() {
  return request<MemberProfile>("/profile", { method: "GET" });
}

/* ── Application types ───────────────────────────────────────────── */

export type JobListing = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  description: string;
  questions: ApplicationQuestion[];
};

export type ApplicationQuestion = {
  questionId: string;
  questionText: string;
  questionType: "radio" | "number" | "text" | "checkbox" | "textarea" | "date";
  required?: boolean;
  options?: string[];
  placeholder?: string;
};

export type JobApplication = {
  id: string;
  userId: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  companyLogoUrl: string | null;
  resumeSource: "cyberjob" | "upload";
  uploadedResumeUrl: string | null;
  answers: { questionId: string; questionText: string; questionType: string; options?: string[]; answer: string | string[] | null }[];
  consentGiven: boolean;
  status: "draft" | "submitted";
  createdAt: string;
  updatedAt: string;
};

export type ApplicationReview = JobApplication & {
  allAnswersComplete: boolean;
  unansweredQuestionIds: string[];
};

/* ── Sample job data (frontend-only, no backend jobs endpoint) ──── */

export const SAMPLE_JOBS: JobListing[] = [
  {
    id: "job-001",
    title: "Frontend Developer",
    company: "CyberTech Solutions",
    location: "กรุงเทพมหานคร",
    salary: "25,000 - 40,000 บาท",
    type: "Full-time",
    description: "พัฒนาและดูแลเว็บแอปพลิเคชันด้วย React/Next.js ร่วมงานกับทีม UI/UX และ Backend",
    questions: [
      { questionId: "q1", questionText: "คุณมีประสบการณ์ทำงานด้าน Frontend กี่ปี?", questionType: "number", required: true, placeholder: "เช่น 3" },
      { questionId: "q2", questionText: "เงินเดือนที่คาดหวัง (บาท)", questionType: "text", required: true, placeholder: "เช่น 35,000" },
      { questionId: "q3", questionText: "คุณสามารถเริ่มงานได้เมื่อใด?", questionType: "date", required: true },
      { questionId: "q4", questionText: "คุณเคยใช้ React ในการทำงานจริงหรือไม่?", questionType: "radio", required: true, options: ["ใช่", "ไม่"] },
      { questionId: "q5", questionText: "เครื่องมือ/เทคโนโลยีที่ถนัด (เลือกได้หลายข้อ)", questionType: "checkbox", options: ["TypeScript", "Tailwind CSS", "Next.js", "GraphQL", "Docker", "Figma"] },
      { questionId: "q6", questionText: "แนะนำตัวเองสั้นๆ ทำไมคุณถึงเหมาะกับตำแหน่งนี้", questionType: "textarea", required: true, placeholder: "พิมพ์แนะนำตัวของคุณที่นี่..." },
    ],
  },
  {
    id: "job-002",
    title: "Backend Developer (NestJS)",
    company: "DataFlow Inc.",
    location: "Remote",
    salary: "30,000 - 50,000 บาท",
    type: "Full-time",
    description: "ออกแบบและพัฒนาระบบ REST API ด้วย NestJS + PostgreSQL ดูแลไมโครเซอร์วิส",
    questions: [
      { questionId: "q1", questionText: "ประสบการณ์ใช้ NestJS กี่ปี?", questionType: "number", required: true, placeholder: "เช่น 2" },
      { questionId: "q2", questionText: "คุณเคยใช้ ORM ใดบ้าง?", questionType: "text", required: true, placeholder: "เช่น TypeORM, Prisma" },
      { questionId: "q3", questionText: "ระดับประสบการณ์ Backend", questionType: "radio", required: true, options: ["Junior", "Mid-level", "Senior"] },
      { questionId: "q4", questionText: "แนะนำตัวเองและประสบการณ์ทำงาน", questionType: "textarea", required: true, placeholder: "เล่าเกี่ยวกับตัวคุณ..." },
    ],
  },
  {
    id: "job-003",
    title: "UI/UX Designer",
    company: "Pixel Studio",
    location: "เชียงใหม่",
    salary: "20,000 - 35,000 บาท",
    type: "Full-time",
    description: "ออกแบบ Interface สำหรับแอปพลิเคชันมือถือและเว็บ สร้าง Wireframe, Prototype และ Design System",
    questions: [
      { questionId: "q1", questionText: "เครื่องมือที่ใช้ออกแบบหลัก", questionType: "radio", required: true, options: ["Figma", "Adobe XD", "Sketch", "InVision"] },
      { questionId: "q2", questionText: "Portfolio URL ของคุณ", questionType: "text", required: true, placeholder: "https://..." },
      { questionId: "q3", questionText: "ประสบการณ์ออกแบบ UI/UX กี่ปี?", questionType: "number", required: true, placeholder: "เช่น 2" },
      { questionId: "q4", questionText: "บอกเล่าประสบการณ์ออกแบบที่ภูมิใจที่สุด", questionType: "textarea", placeholder: "เล่าประสบการณ์ของคุณ..." },
    ],
  },
  {
    id: "job-004",
    title: "DevOps Engineer",
    company: "Cloud Nine Systems",
    location: "กรุงเทพมหานคร",
    salary: "35,000 - 55,000 บาท",
    type: "Full-time",
    description: "ดูแลระบบ CI/CD, Infrastructure as Code บน AWS/GCP ใช้ Docker, Kubernetes, Terraform",
    questions: [
      { questionId: "q1", questionText: "Cloud provider ที่ถนัด (เลือกได้หลายข้อ)", questionType: "checkbox", required: true, options: ["AWS", "GCP", "Azure", "DigitalOcean"] },
      { questionId: "q2", questionText: "ประสบการณ์ใช้ Docker", questionType: "radio", required: true, options: ["ไม่เคยใช้", "ใช้เป็น", "ใช้เป็นงานหลัก", "เป็นผู้เชี่ยวชาญ"] },
      { questionId: "q3", questionText: "เงินเดือนที่คาดหวัง (บาท)", questionType: "text", required: true, placeholder: "เช่น 45,000" },
      { questionId: "q4", questionText: "แนะนำตัวเองและทำไมถึงสนใจตำแหน่งนี้", questionType: "textarea", required: true, placeholder: "พิมพ์แนะนำตัวของคุณที่นี่..." },
    ],
  },
  {
    id: "job-005",
    title: "Mobile Developer (React Native)",
    company: "AppVerse Co.",
    location: "ภูเก็ต",
    salary: "25,000 - 45,000 บาท",
    type: "Full-time",
    description: "พัฒนาแอปพลิเคชันมือถือข้ามแพลตฟอร์มด้วย React Native เชื่อมต่อ REST API",
    questions: [
      { questionId: "q1", questionText: "คุณเคยเผยแพร่แอปบน App Store หรือ Google Play หรือไม่?", questionType: "radio", required: true, options: ["เคย", "ไม่เคย"] },
      { questionId: "q2", questionText: "แพลตฟอร์มที่ถนัด (เลือกได้หลายข้อ)", questionType: "checkbox", required: true, options: ["iOS", "Android", "ทั้งสอง"] },
      { questionId: "q3", questionText: "ประสบการณ์ใช้ React Native กี่ปี?", questionType: "number", required: true, placeholder: "เช่น 2" },
      { questionId: "q4", questionText: "แนะนำตัวเองสั้นๆ", questionType: "textarea", required: true, placeholder: "พิมพ์แนะนำตัวของคุณที่นี่..." },
    ],
  },
];

/* ── Application API calls ───────────────────────────────────────── */

export function createApplication(data: { resumeSource: "cyberjob" | "upload"; jobId: string; jobTitle: string; companyName: string; companyLogoUrl?: string }) {
  return request<JobApplication>("/applications", { method: "POST", body: JSON.stringify(data) });
}

export function getApplications() {
  return request<JobApplication[]>("/applications", { method: "GET" });
}

export function getApplication(id: string) {
  return request<JobApplication>(`/applications/${id}`, { method: "GET" });
}

export function updateResume(id: string, data: { resumeSource: "cyberjob" | "upload"; uploadedResumeUrl?: string }) {
  return request<JobApplication>(`/applications/${id}/resume`, { method: "PATCH", body: JSON.stringify(data) });
}

export function saveAnswers(id: string, answers: { questionId: string; questionText: string; questionType: string; options?: string[]; answer: string | string[] | null }[]) {
  return request<JobApplication>(`/applications/${id}/answers`, { method: "PUT", body: JSON.stringify({ answers }) });
}

export function getApplicationReview(id: string) {
  return request<ApplicationReview>(`/applications/${id}/review`, { method: "GET" });
}

export function submitApplication(id: string, consentGiven: boolean) {
  return request<JobApplication>(`/applications/${id}/submit`, { method: "POST", body: JSON.stringify({ consentGiven }) });
}

export async function findDraftApplication(jobId: string): Promise<JobApplication | null> {
  const apps = await getApplications();
  return apps.find((a) => a.jobId === jobId && a.status === "draft") ?? null;
}
