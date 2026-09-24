'use client';

import { useState } from 'react';
import { ShareIcon, CheckIcon } from '@/public-site/components/Icons';

export function ArticleShareBar({ title, url }: { title: string; url?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof window !== 'undefined') {
      const shareUrl = url || window.location.href;
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  };

  const handleShareFacebook = () => {
    if (typeof window !== 'undefined') {
      const shareUrl = url || window.location.href;
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        '_blank',
        'noopener,noreferrer'
      );
    }
  };

  const handleShareTwitter = () => {
    if (typeof window !== 'undefined') {
      const shareUrl = url || window.location.href;
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
        '_blank',
        'noopener,noreferrer'
      );
    }
  };

  const handleShareLine = () => {
    if (typeof window !== 'undefined') {
      const shareUrl = url || window.location.href;
      window.open(
        `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`,
        '_blank',
        'noopener,noreferrer'
      );
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-blue-100 bg-blue-50/50 p-4 sm:p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-brand-900">
        <ShareIcon width={18} height={18} className="text-brand-600" />
        <span>แชร์บทความนี้:</span>
      </div>

      <div className="flex items-center gap-2">
        {/* Copy Link */}
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-brand-600 active:scale-95"
          title="คัดลอกลิงก์"
        >
          {copied ? (
            <>
              <CheckIcon width={14} height={14} className="text-emerald-600" />
              <span className="text-emerald-600 font-bold">คัดลอกแล้ว!</span>
            </>
          ) : (
            <span>คัดลอกลิงก์</span>
          )}
        </button>

        {/* Facebook */}
        <button
          type="button"
          onClick={handleShareFacebook}
          className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#1877F2] text-xs font-bold text-white shadow-sm transition hover:opacity-90 active:scale-95"
          aria-label="Share on Facebook"
          title="แชร์ไปยัง Facebook"
        >
          f
        </button>

        {/* X / Twitter */}
        <button
          type="button"
          onClick={handleShareTwitter}
          className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-black text-xs font-bold text-white shadow-sm transition hover:opacity-90 active:scale-95"
          aria-label="Share on X"
          title="แชร์ไปยัง X"
        >
          𝕏
        </button>

        {/* LINE */}
        <button
          type="button"
          onClick={handleShareLine}
          className="inline-flex h-8 items-center justify-center rounded-xl bg-[#06C755] px-2.5 text-xs font-bold text-white shadow-sm transition hover:opacity-90 active:scale-95"
          aria-label="Share on LINE"
          title="แชร์ไปยัง LINE"
        >
          LINE
        </button>
      </div>
    </div>
  );
}
