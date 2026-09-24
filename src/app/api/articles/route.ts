import { NextResponse } from 'next/server';
import { articles, articleCategories } from '@/app/articles/article-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limitParam = searchParams.get('limit');
  const pageSize = limitParam ? Math.max(1, parseInt(limitParam, 10)) : Math.max(1, parseInt(searchParams.get('pageSize') || '6', 10));
  const category = searchParams.get('category') || 'ทั้งหมด';
  const q = (searchParams.get('q') || '').trim().toLowerCase();

  let filtered = [...articles];

  // Category filter
  if (category && category !== 'ทั้งหมด' && category !== 'All') {
    filtered = filtered.filter(
      (a) =>
        a.category.toLowerCase() === category.toLowerCase() ||
        a.categoryEn.toLowerCase() === category.toLowerCase()
    );
  }

  // Keyword search
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

  return NextResponse.json({
    items,
    total,
    page: safePage,
    pageSize,
    totalPages,
    categories: articleCategories,
  });
}
