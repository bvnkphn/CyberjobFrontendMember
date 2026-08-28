'use client';

import { useEffect, useState } from 'react';
import { supportService } from '@/public-site/services/jobs.service';
import { useI18n } from '@/public-site/i18n/LanguageProvider';
import { CheckIcon, CloseIcon, HeadsetIcon } from './Icons';

/**
 * Feature 3.4 – Contact Support
 * แถบสีเหลืองพร้อมปุ่ม "ติดต่อฝ่ายสนับสนุน" ที่แสดงอยู่ทุกหน้า (อยู่ใน layout)
 */
export function ContactSupportBand() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <>
      <section className="bg-accent-300">
        <div className="container-page flex flex-col items-center gap-3 py-10 text-center">
          <h2 className="text-xl font-bold text-brand-900 sm:text-2xl">
            {t('support.title')}
          </h2>
          <p className="max-w-2xl text-sm text-brand-900/80">
            {t('support.subtitle')}
          </p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="btn-brand mt-1"
          >
            <HeadsetIcon width={18} height={18} />
            {t('support.cta')}
          </button>
        </div>
      </section>

      {open && <SupportDialog onClose={() => setOpen(false)} />}
    </>
  );
}

function SupportDialog({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const [topics, setTopics] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>(
    'idle',
  );
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    topic: '',
    message: '',
  });

  useEffect(() => {
    supportService.topics().then((list) => {
      setTopics(list);
      setForm((f) => (f.topic ? f : { ...f, topic: list[0] ?? '' }));
    });
  }, []);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onEsc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await supportService.submit(form);
      setTicketId(res.ticketId);
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-brand-950/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('support.formTitle')}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-pop">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="flex items-center gap-2 text-base font-bold text-brand-900">
            <HeadsetIcon width={20} height={20} className="text-brand-600" />
            {t('support.formTitle')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('support.close')}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <CloseIcon />
          </button>
        </div>

        {status === 'sent' ? (
          <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckIcon width={26} height={26} />
            </span>
            <p className="text-sm text-slate-700">{t('support.success')}</p>
            {ticketId && (
              <p className="chip font-mono">{ticketId}</p>
            )}
            <button type="button" onClick={onClose} className="btn-outline mt-2">
              {t('support.close')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 px-5 py-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-600">
                  {t('support.name')}
                </span>
                <input
                  required
                  minLength={2}
                  className="field"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-600">
                  {t('support.email')}
                </span>
                <input
                  required
                  type="email"
                  className="field"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-600">
                {t('support.topic')}
              </span>
              <select
                required
                className="field"
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
              >
                {topics.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-600">
                {t('support.message')}
              </span>
              <textarea
                required
                minLength={10}
                rows={4}
                className="field resize-none"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </label>

            {status === 'error' && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                {t('support.error')}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={onClose} className="btn-ghost">
                {t('support.close')}
              </button>
              <button
                type="submit"
                disabled={status === 'sending'}
                className="btn-accent"
              >
                {status === 'sending' ? t('support.sending') : t('support.send')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

