import type { ArticleItem } from '@/app/articles/article-data';
import { articles, articleCategories } from '@/app/articles/article-data';

export interface ArticlesQuery {
  category?: string;
  page?: number;
  pageSize?: number;
  q?: string;
  limit?: number;
}

export interface PaginatedArticles {
  items: ArticleItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  categories: string[];
}

export const articlesService = {
  /** ค้นหา กรองหมวดหมู่ และแบ่งหน้าผ่าน API */
  async search(query: ArticlesQuery = {}): Promise<PaginatedArticles> {
    const sp = new URLSearchParams();
    if (query.category && query.category !== 'ทั้งหมด') sp.set('category', query.category);
    if (query.page) sp.set('page', String(query.page));
    if (query.pageSize) sp.set('pageSize', String(query.pageSize));
    if (query.limit) sp.set('limit', String(query.limit));
    if (query.q) sp.set('q', query.q);

    const queryString = sp.toString() ? `?${sp.toString()}` : '';

    // First attempt: fetch from Next.js internal API endpoint
    try {
      const url = `/api/articles${queryString}`;
      const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback to local data calculation if fetch not available (e.g. static prerendering)
    }

    // Direct synchronous fallback calculation
    const page = Math.max(1, query.page || 1);
    const pageSize = query.limit || query.pageSize || 6;
    const category = query.category || 'ทั้งหมด';
    const q = (query.q || '').trim().toLowerCase();

    let filtered = [...articles];

    if (category && category !== 'ทั้งหมด' && category !== 'All') {
      filtered = filtered.filter(
        (a) =>
          a.category.toLowerCase() === category.toLowerCase() ||
          a.categoryEn.toLowerCase() === category.toLowerCase()
      );
    }

    if (q) {
      filtered = filtered.filter((a) => {
        const title = (a.title + ' ' + a.titleEn).toLowerCase();
        const excerpt = (a.excerpt + ' ' + a.excerptEn).toLowerCase();
        const tags = a.tags.join(' ').toLowerCase();
        return title.includes(q) || excerpt.includes(q) || tags.includes(q);
      });
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return {
      items,
      total,
      page: safePage,
      pageSize,
      totalPages,
      categories: articleCategories,
    };
  },

  /** ดึงบทความเดี่ยว */
  async findOne(slug: string): Promise<ArticleItem | null> {
    try {
      const res = await fetch(`/api/articles/${encodeURIComponent(slug)}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        return data.article;
      }
    } catch {
      // fallback
    }
    return articles.find((a) => a.slug === slug) ?? null;
  },

  /** ดึงบทความล่าสุดสำหรับหน้าแรก (3 รายการ) */
  async latest(limit = 3): Promise<ArticleItem[]> {
    const res = await this.search({ limit });
    return res.items;
  },
};
