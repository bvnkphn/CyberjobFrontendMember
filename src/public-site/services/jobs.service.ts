import {
  CATEGORY_TREE,
  EMPLOYMENT_TYPES,
  EXPERIENCE_LEVELS,
  POSTED_WITHIN,
  REGION_TREE,
  SALARY_RANGE,
  SORTS,
  WORK_STYLES,
} from '@cyberjob/shared';
import type {
  Company,
  FilterMeta,
  Job,
  JobQuery,
  Paginated,
  SupportRequest,
  Suggestion,
} from '@cyberjob/shared';
import { apiGet, apiPost, buildQuery } from '@/public-site/lib/api';

/**
 * Service layer ของฝั่งเว็บ
 * — เรียก NestJS API เท่านั้น (ไม่มี mock fallback)
 * — ถ้า API ไม่ตอบสนอง จะ return ค่าว่าง เพื่อให้ UI แสดง empty state ที่ถูกต้อง
 */

export const jobsService = {
  /** Feature 3.1 + 3.2 + 3.3 – ค้นหา กรอง เรียง และแบ่งหน้า */
  async search(query: JobQuery): Promise<Paginated<Job>> {
    try {
      return await apiGet<Paginated<Job>>(
        `/jobs${buildQuery(query as Record<string, unknown>)}`,
      );
    } catch {
      return { items: [], total: 0, page: 1, pageSize: 20, totalPages: 0 };
    }
  },

  /** Feature 3.1 – Search Auto */
  suggest(term: string, limit = 8): Promise<Suggestion[]> {
    if (!term.trim()) return Promise.resolve([]);
    return apiGet<Suggestion[]>(`/jobs/suggest${buildQuery({ q: term, limit })}`).catch(() => []);
  },

  /** ตำแหน่งงานแนะนำหน้าแรก */
  async recommended(limit = 3): Promise<Job[]> {
    try {
      return await apiGet<Job[]>(`/jobs/recommended${buildQuery({ limit })}`);
    } catch {
      return [];
    }
  },

  async findOne(idOrSlug: string): Promise<Job | null> {
    try {
      return await apiGet<Job>(`/jobs/${encodeURIComponent(idOrSlug)}`);
    } catch {
      return null;
    }
  },

  /** "งานที่แนะนำ" ท้ายหน้ารายละเอียดงาน */
  async related(idOrSlug: string, limit = 2): Promise<Job[]> {
    try {
      return await apiGet<Job[]>(
        `/jobs/${encodeURIComponent(idOrSlug)}/related${buildQuery({ limit })}`,
      );
    } catch {
      return [];
    }
  },

  /** Feature 7.1 – ดึงงานที่ผู้ใช้บันทึกไว้ */
  async findMany(ids: string[]): Promise<Job[]> {
    if (!ids.length) return [];
    try {
      return await apiGet<Job[]>(`/jobs/bookmarks${buildQuery({ ids })}`);
    } catch {
      return [];
    }
  },
};

export type CompanyWithCount = Company & { jobCount: number };

export const companiesService = {
  /** โปรไฟล์บริษัท */
  async findOne(slug: string): Promise<CompanyWithCount | null> {
    try {
      return await apiGet<CompanyWithCount>(`/companies/${encodeURIComponent(slug)}`);
    } catch {
      return null;
    }
  },

  /** งานทั้งหมดของบริษัท */
  async jobs(slug: string, query: JobQuery = {}): Promise<Paginated<Job>> {
    try {
      return await apiGet<Paginated<Job>>(
        `/companies/${encodeURIComponent(slug)}/jobs${buildQuery(
          query as Record<string, unknown>,
        )}`,
      );
    } catch {
      return { items: [], total: 0, page: 1, pageSize: 20, totalPages: 0 };
    }
  },
};

export const metaService = {
  /** ตัวเลือกของแผงกรองทั้งหมด */
  async filters(): Promise<FilterMeta> {
    try {
      return await apiGet<FilterMeta>('/meta/filters');
    } catch {
      return {
        categoryTree: CATEGORY_TREE,
        regionTree: REGION_TREE,
        workStyles: WORK_STYLES,
        employmentTypes: EMPLOYMENT_TYPES,
        experienceLevels: EXPERIENCE_LEVELS,
        postedWithin: POSTED_WITHIN,
        sorts: SORTS,
        salary: SALARY_RANGE,
      };
    }
  },
};

export const supportService = {
  /** Feature 3.4 – ส่งเรื่องถึงฝ่ายสนับสนุน */
  submit(payload: SupportRequest): Promise<{ ticketId: string; message: string }> {
    return apiPost<{ ticketId: string; message: string }>('/support', payload);
  },

  async topics(): Promise<string[]> {
    try {
      return await apiGet<string[]>('/support/topics');
    } catch {
      return [
        'ปัญหาการเข้าสู่ระบบ',
        'ปัญหาการสมัครงาน',
        'ปัญหาการฝากประวัติ / เรซูเม่',
        'สอบถามสำหรับผู้ประกอบการ',
        'แจ้งประกาศงานที่ไม่เหมาะสม',
        'อื่น ๆ',
      ];
    }
  },
};

