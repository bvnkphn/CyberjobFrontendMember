'use client';

import { useEffect, useState, type FormEvent } from 'react';
import type { JobQuestion } from '@cyberjob/shared';
import { useI18n } from '@/public-site/i18n/LanguageProvider';

type Answers = Record<string, string | string[]>;

/** ตอบคำถามคัดกรองของประกาศงานก่อนส่งใบสมัคร (คำถามตั้งจากหลังบ้านผู้ประกอบการ) */
export function ApplyQuestionsDialog({
  jobTitle,
  questions,
  submitting,
  error,
  onCancel,
  onSubmit,
}: {
  jobTitle: string;
  questions: JobQuestion[];
  submitting: boolean;
  error: string | null;
  onCancel: () => void;
  onSubmit: (answers: Array<{ questionId: string; answer: string | string[] }>) => void;
}) {
  const { lang } = useI18n();
  const L = (th: string, en: string) => (lang === 'en' ? en : th);
  const [answers, setAnswers] = useState<Answers>({});
  const [missing, setMissing] = useState<string[]>([]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !submitting) onCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel, submitting]);

  const setAnswer = (id: string, value: string | string[]) => {
    setAnswers((current) => ({ ...current, [id]: value }));
    setMissing((current) => current.filter((item) => item !== id));
  };

  const isEmpty = (value: string | string[] | undefined) =>
    value === undefined || (Array.isArray(value) ? value.length === 0 : value.trim() === '');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const unanswered = questions.filter((question) => question.required && isEmpty(answers[question.id])).map((question) => question.id);
    setMissing(unanswered);
    if (unanswered.length) return;
    onSubmit(
      questions
        .filter((question) => !isEmpty(answers[question.id]))
        .map((question) => ({ questionId: question.id, answer: answers[question.id] })),
    );
  };

  const inputClass =
    'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-brand-500 focus:outline-none';

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 px-4 py-10"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) onCancel();
      }}
    >
      <form
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="apply-questions-title"
        className="w-full max-w-lg rounded-xl bg-white shadow-xl"
        noValidate
      >
        <header className="border-b border-slate-100 px-5 py-4">
          <h2 id="apply-questions-title" className="text-base font-bold text-brand-900">
            {L('ตอบคำถามก่อนสมัครงาน', 'Answer before applying')}
          </h2>
          <p className="mt-1 text-[13px] text-slate-500">{jobTitle}</p>
        </header>

        <div className="space-y-5 px-5 py-4">
          {questions.map((question, index) => {
            const value = answers[question.id];
            const invalid = missing.includes(question.id);
            return (
              <fieldset key={question.id} className="space-y-2">
                <legend className="text-sm font-semibold text-slate-700">
                  {index + 1}. {question.text}
                  {question.required ? (
                    <span className="text-red-500"> *</span>
                  ) : (
                    <span className="font-normal text-slate-400"> {L('(ไม่บังคับ)', '(optional)')}</span>
                  )}
                </legend>

                {question.type === 'single' &&
                  question.options.map((option) => (
                    <label key={option} className="flex items-center gap-2 text-sm text-slate-600">
                      <input
                        type="radio"
                        name={question.id}
                        checked={value === option}
                        onChange={() => setAnswer(question.id, option)}
                      />
                      {option}
                    </label>
                  ))}

                {question.type === 'multi' && (
                  <div className="flex flex-wrap gap-2">
                    {question.options.map((option) => {
                      const selected = Array.isArray(value) && value.includes(option);
                      return (
                        <button
                          key={option}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => {
                            const current = Array.isArray(value) ? value : [];
                            setAnswer(question.id, selected ? current.filter((item) => item !== option) : [...current, option]);
                          }}
                          className={`rounded-full border px-3 py-1 text-[13px] ${
                            selected ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 text-slate-600'
                          }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                )}

                {question.type === 'date' && (
                  <input
                    type="date"
                    className={inputClass}
                    value={typeof value === 'string' ? value : ''}
                    onChange={(event) => setAnswer(question.id, event.target.value)}
                  />
                )}

                {question.type === 'short' && (
                  <input
                    type="text"
                    maxLength={300}
                    className={inputClass}
                    value={typeof value === 'string' ? value : ''}
                    onChange={(event) => setAnswer(question.id, event.target.value)}
                  />
                )}

                {question.type === 'long' && (
                  <textarea
                    rows={4}
                    maxLength={4000}
                    className={inputClass}
                    value={typeof value === 'string' ? value : ''}
                    onChange={(event) => setAnswer(question.id, event.target.value)}
                  />
                )}

                {invalid && <p className="text-xs text-red-600">{L('กรุณาตอบคำถามนี้', 'Please answer this question')}</p>}
              </fieldset>
            );
          })}

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
        </div>

        <footer className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3">
          <button type="button" className="btn-outline" onClick={onCancel} disabled={submitting}>
            {L('ยกเลิก', 'Cancel')}
          </button>
          <button type="submit" className="btn-brand" disabled={submitting}>
            {submitting ? L('กำลังส่งใบสมัคร...', 'Submitting...') : L('ส่งใบสมัคร', 'Submit application')}
          </button>
        </footer>
      </form>
    </div>
  );
}
