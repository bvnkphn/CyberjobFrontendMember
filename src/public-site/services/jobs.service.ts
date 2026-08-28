import {
  CATEGORY_TREE,
  EMPLOYMENT_TYPES,
  EXPERIENCE_LEVELS,
  MOCK_COMPANIES,
  MOCK_JOBS,
  POSTED_WITHIN,
  REGION_TREE,
  SALARY_RANGE,
  SORTS,
  WORK_STYLES,
  recommendedJobs,
  relatedJobs,
  searchJobs,
  suggest as suggestLocal,
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
 * — เรียก NestJS API เป็นหลัก
 * — ถ้า API ยังไม่ได้รัน จะ fallback ไปคำนวณจากข้อมูลตัวอย่างใน @cyberjob/shared
 *   เพื่อให้พัฒนา UI ต่อได้โดยไม่ต้องรอ backend
 */

let apiWarned = false;

async function withFallback<T>(
  call: () => Promise<T>,
  fallback: () => T,
): Promise<T> {
  try {
    return await call();
  } catch (error) {
    if (!apiWarned) {
      apiWarned = true;
      // eslint-disable-next-line no-console
      console.warn(
        '[cyberjob] เรียก API ไม่สำเร็จ กำลังใช้ข้อมูลตัวอย่างแทน:',
        (error as Error).message,
      );
    }
    return fallback();
  }
}

function localJob(idOrSlug: string): Job | null {
  return MOCK_JOBS.find((j) => j.id === idOrSlug || j.slug === idOrSlug) ?? null;
}

export const jobsService = {
  /** Feature 3.1 + 3.2 + 3.3 – ค้นหา กรอง เรียง และแบ่งหน้า */
  search(query: JobQuery): Promise<Paginated<Job>> {
    return withFallback(
      () =>
        apiGet<Paginated<Job>>(
          `/jobs${buildQuery(query as Record<string, unknown>)}`,
        ),
      () => searchJobs(MOCK_JOBS, query),
    );
  },

  /** Feature 3.1 – Search Auto */
  suggest(term: string, limit = 8): Promise<Suggestion[]> {
    if (!term.trim()) return Promise.resolve([]);
    return withFallback(
      () =>
        apiGet<Suggestion[]>(`/jobs/suggest${buildQuery({ q: term, limit })}`),
      () => suggestLocal(MOCK_JOBS, term, limit),
    );
  },

  /** ตำแหน่งงานแนะนำหน้าแรก */
  recommended(limit = 3): Promise<Job[]> {
    return withFallback(
      () => apiGet<Job[]>(`/jobs/recommended${buildQuery({ limit })}`),
      () => recommendedJobs(MOCK_JOBS, limit),
    );
  },

  findOne(idOrSlug: string): Promise<Job | null> {
    return withFallback(
      () => apiGet<Job>(`/jobs/${encodeURIComponent(idOrSlug)}`),
      () => localJob(idOrSlug),
    );
  },

  /** "งานที่แนะนำ" ท้ายหน้ารายละเอียดงาน */
  related(idOrSlug: string, limit = 2): Promise<Job[]> {
    return withFallback(
      () =>
        apiGet<Job[]>(
          `/jobs/${encodeURIComponent(idOrSlug)}/related${buildQuery({ limit })}`,
        ),
      () => {
        const job = localJob(idOrSlug);
        return job ? relatedJobs(MOCK_JOBS, job, limit) : [];
      },
    );
  },

  /** Feature 7.1 – ดึงงานที่ผู้ใช้บันทึกไว้ */
  findMany(ids: string[]): Promise<Job[]> {
    if (!ids.length) return Promise.resolve([]);
    return withFallback(
      () => apiGet<Job[]>(`/jobs/bookmarks${buildQuery({ ids })}`),
      () => MOCK_JOBS.filter((j) => ids.includes(j.id)),
    );
  },
};

export type CompanyWithCount = Company & { jobCount: number };

export const companiesService = {
  /** โปรไฟล์บริษัท */
  findOne(slug: string): Promise<CompanyWithCount | null> {
    return withFallback(
      () => apiGet<CompanyWithCount>(`/companies/${encodeURIComponent(slug)}`),
      () => {
        const company = MOCK_COMPANIES.find(
          (c) => c.slug === slug || c.id === slug,
        );
        if (!company) return null;
        return {
          ...company,
          jobCount: MOCK_JOBS.filter((j) => j.company.slug === company.slug)
            .length,
        };
      },
    );
  },

  /** งานทั้งหมดของบริษัท */
  jobs(slug: string, query: JobQuery = {}): Promise<Paginated<Job>> {
    return withFallback(
      () =>
        apiGet<Paginated<Job>>(
          `/companies/${encodeURIComponent(slug)}/jobs${buildQuery(
            query as Record<string, unknown>,
          )}`,
        ),
      () => searchJobs(MOCK_JOBS, { ...query, companySlug: slug }),
    );
  },
};

export const metaService = {
  /** ตัวเลือกของแผงกรองทั้งหมด */
  filters(): Promise<FilterMeta> {
    return withFallback(
      () => apiGet<FilterMeta>('/meta/filters'),
      () => ({
        categoryTree: CATEGORY_TREE,
        regionTree: REGION_TREE,
        workStyles: WORK_STYLES,
        employmentTypes: EMPLOYMENT_TYPES,
        experienceLevels: EXPERIENCE_LEVELS,
        postedWithin: POSTED_WITHIN,
        sorts: SORTS,
        salary: SALARY_RANGE,
      }),
    );
  },
};

export const supportService = {
  /** Feature 3.4 – ส่งเรื่องถึงฝ่ายสนับสนุน */
  submit(payload: SupportRequest): Promise<{ ticketId: string; message: string }> {
    return apiPost<{ ticketId: string; message: string }>('/support', payload);
  },

  topics(): Promise<string[]> {
    return withFallback(
      () => apiGet<string[]>('/support/topics'),
      () => [
        'ปัญหาการเข้าสู่ระบบ',
        'ปัญหาการสมัครงาน',
        'ปัญหาการฝากประวัติ / เรซูเม่',
        'สอบถามสำหรับผู้ประกอบการ',
        'แจ้งประกาศงานที่ไม่เหมาะสม',
        'อื่น ๆ',
      ],
    );
  },
};

