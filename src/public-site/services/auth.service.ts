import type { AuthResult, AuthUser, Job, JobApplication, LoginRequest, RegisterRequest, MemberInvitation } from '@cyberjob/shared';
import { API_BASE, apiDelete, apiGet, apiPost, setAccessToken, apiPatch } from '@/public-site/lib/api';

export const authService = {
  register(payload: RegisterRequest): Promise<AuthResult> {
    return apiPost<AuthResult>('/auth/register', payload, { skipRefresh: true });
  },

  login(payload: LoginRequest): Promise<AuthResult> {
    return apiPost<AuthResult>('/auth/login', payload, { skipRefresh: true });
  },

  /** ต่ออายุ session จาก refresh cookie (ใช้ตอนเปิดเว็บครั้งแรก) */
  refresh(): Promise<AuthResult> {
    return apiPost<AuthResult>('/auth/refresh', undefined, { skipRefresh: true });
  },

  async logout(): Promise<void> {
    try {
      await apiPost<{ ok: true }>('/auth/logout', undefined, {
        skipRefresh: true,
      });
    } finally {
      setAccessToken(null);
    }
  },

  me(): Promise<AuthUser> {
    return apiGet<AuthUser>('/auth/me');
  },

  /** URL สำหรับเริ่มขั้นตอน OAuth 2.0 กับ Google */
  googleAuthUrl(): string {
    return `${API_BASE}/auth/google`;
  },
};

export const meService = {
  bookmarks(): Promise<Job[]> {
    return apiGet<Job[]>('/me/bookmarks');
  },

  addBookmark(jobId: string): Promise<{ ok: true }> {
    return apiPost<{ ok: true }>('/me/bookmarks', { jobId });
  },

  removeBookmark(jobId: string): Promise<{ ok: true }> {
    return apiDelete<{ ok: true }>(`/me/bookmarks/${encodeURIComponent(jobId)}`);
  },

  /** ย้ายงานที่บันทึกไว้ในเครื่องเข้าบัญชีหลังล็อกอิน */
  syncBookmarks(jobIds: string[]): Promise<Job[]> {
    return apiPost<Job[]>('/me/bookmarks/sync', { jobIds });
  },

  applications(): Promise<JobApplication[]> {
    return apiGet<JobApplication[]>('/me/applications');
  },

  /** answers = คำตอบคำถามคัดกรองของประกาศ (Owner Feature 4.2.1) */
  apply(
    jobId: string,
    answers: Array<{ questionId: string; answer: string | string[] }> = [],
    coverLetter?: string,
  ): Promise<JobApplication> {
    return apiPost<JobApplication>('/me/applications', { jobId, coverLetter, answers });
  },

  /** คำเชิญจากบริษัท */
  invitations(): Promise<MemberInvitation[]> {
    return apiGet<MemberInvitation[]>('/me/invitations');
  },

  respondInvitation(id: string, status: 'accepted' | 'declined'): Promise<MemberInvitation> {
    return apiPatch<MemberInvitation>(`/me/invitations/${encodeURIComponent(id)}`, { status });
  },
};

