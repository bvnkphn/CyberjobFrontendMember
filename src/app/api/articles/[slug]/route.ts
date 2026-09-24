import { NextResponse } from 'next/server';
import { articles } from '@/app/articles/article-data';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);

  if (!article) {
    return NextResponse.json({ message: 'Article not found' }, { status: 404 });
  }

  const related = articles
    .filter((a) => a.slug !== article.slug)
    .slice(0, 3);

  return NextResponse.json({ article, related });
}
