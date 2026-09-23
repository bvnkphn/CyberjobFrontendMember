"use client";

import { useState } from "react";
import type { JobQuestion, QuestionType } from "@/lib/types";

/** คำถามในฟอร์ม – uid ใช้เป็น key ระหว่างแก้ไข (id มีเฉพาะคำถามที่บันทึกแล้ว) */
export type ScreeningQuestion = JobQuestion & { uid: number };
import { useLanguage } from "@/lib/i18n/LanguageContext";
import styles from "./ScreeningQuestionBuilder.module.css";

const QUESTION_TYPES: { value: QuestionType; th: string; en: string }[] = [
  { value: "single", th: "เลือกตอบ", en: "Multiple choice" },
  { value: "date", th: "วันที่", en: "Date" },
  { value: "short", th: "ข้อความสั้น", en: "Short answer" },
  { value: "multi", th: "เลือกหลายข้อ", en: "Multiple selection" },
  { value: "long", th: "ข้อความยาว", en: "Long answer" },
];

function TypeIcon({ type }: { type: QuestionType }) {
  switch (type) {
    case "single":
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
        </svg>
      );
    case "date":
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );
    case "short":
      return (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 4h10M8 4v8" />
        </svg>
      );
    case "multi":
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      );
    case "long":
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="3" y1="6" x2="5" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="3" y1="12" x2="5" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="18" x2="5" y2="18" />
        </svg>
      );
  }
}

interface ScreeningQuestionBuilderProps {
  question: ScreeningQuestion;
  index: number;
  onChange: (next: ScreeningQuestion) => void;
  onRemove: () => void;
}

export default function ScreeningQuestionBuilder({
  question,
  index,
  onChange,
  onRemove,
}: ScreeningQuestionBuilderProps) {
  const { t, isEn } = useLanguage();
  const [optionInput, setOptionInput] = useState("");
  const [selectedPills, setSelectedPills] = useState<string[]>([]);

  const togglePill = (opt: string) => {
    setSelectedPills((prev) =>
      prev.includes(opt) ? prev.filter((p) => p !== opt) : [...prev, opt]
    );
  };

  const setType = (type: QuestionType) => onChange({ ...question, type });
  const setText = (text: string) => onChange({ ...question, text });

  const addOption = () => {
    const value = optionInput.trim();
    if (value && !question.options.includes(value)) {
      onChange({ ...question, options: [...question.options, value] });
    }
    setOptionInput("");
  };

  const removeOption = (option: string) => {
    onChange({
      ...question,
      options: question.options.filter((o) => o !== option),
    });
  };

  const handleOptionKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addOption();
    }
  };

  const acceptsOptions = question.type === "single" || question.type === "multi";

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.numberBadge}>{index + 1}</span>
        <input
          className={styles.questionInput}
          type="text"
          value={question.text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("screening.questionPlaceholder")}
        />
        <button
          type="button"
          className={styles.removeButton}
          onClick={onRemove}
          aria-label={t("screening.removeQuestion")}
        >
          ×
        </button>
      </div>

      <div className={styles.tabs} role="tablist">
        {QUESTION_TYPES.map((qt) => {
          const active = question.type === qt.value;
          return (
            <button
              key={qt.value}
              type="button"
              role="tab"
              aria-selected={active}
              className={`${styles.tab} ${active ? styles.tabActive : ""}`}
              onClick={() => setType(qt.value)}
            >
              <TypeIcon type={qt.value} />
              <span>{isEn ? qt.en : qt.th}</span>
            </button>
          );
        })}
      </div>

      <label className={styles.requiredToggle}>
        <input
          type="checkbox"
          checked={question.required}
          onChange={(e) => onChange({ ...question, required: e.target.checked })}
        />
        <span>{isEn ? "Required" : "บังคับตอบ"}</span>
      </label>

      {acceptsOptions && (
        <div className={styles.optionSection}>
          <div className={styles.optionInputWrap}>
            {question.options.map((opt) => (
              <span key={opt} className={styles.optionTag}>
                {opt}
                <button
                  type="button"
                  className={styles.optionRemove}
                  onClick={() => removeOption(opt)}
                  aria-label={isEn ? `Remove ${opt}` : `ลบ ${opt}`}
                >
                  ×
                </button>
              </span>
            ))}
            <input
              className={styles.optionInput}
              type="text"
              value={optionInput}
              onChange={(e) => setOptionInput(e.target.value)}
              onKeyDown={handleOptionKeyDown}
              onBlur={addOption}
              placeholder={t("screening.optionPlaceholder")}
            />
          </div>
        </div>
      )}

      <div className={styles.preview}>
        <div className={styles.previewLabel}>{t("screening.preview")}</div>
        <div className={styles.previewBody}>
          <div className={styles.previewQuestion}>
            {index + 1}. {question.text || t("screening.question")}
          </div>

          {question.type === "single" && (
            <div className={styles.previewOptionsList}>
              {(question.options.length ? question.options : ["ใช่", "ไม่ใช่"]).map(
                (opt) => (
                  <label key={opt} className={styles.radioRow}>
                    <input type="radio" name={`preview-single-${question.uid}`} />
                    <span>{opt}</span>
                  </label>
                )
              )}
            </div>
          )}

          {question.type === "multi" && (
            <div className={styles.previewPills}>
              {(question.options.length ? question.options : ["JavaScript", "Python", "Go"]).map(
                (opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={`${styles.pill} ${
                      selectedPills.includes(opt) ? styles.pillActive : ""
                    }`}
                    onClick={() => togglePill(opt)}
                  >
                    {opt}
                  </button>
                )
              )}
            </div>
          )}

          {question.type === "date" && (
            <div className={styles.dateField}>
              <input
                type="text"
                placeholder={t("screening.selectDatePlaceholder")}
                readOnly
                onFocus={(e) => e.currentTarget.blur()}
              />
              <TypeIcon type="date" />
            </div>
          )}

          {question.type === "short" && (
            <input
              className={styles.previewInput}
              type="text"
              placeholder={t("screening.shortAnswerPlaceholder")}
              readOnly
            />
          )}

          {question.type === "long" && (
            <textarea
              className={styles.previewTextarea}
              placeholder={t("screening.longAnswerPlaceholder")}
              readOnly
            />
          )}
        </div>
      </div>
    </div>
  );
}
