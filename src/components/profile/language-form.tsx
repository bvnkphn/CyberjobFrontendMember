import { useRef, useState, type FormEvent } from "react";

type LanguageFormProps = {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  saved: boolean;
  initialData?: Record<string, unknown>;
};

type LanguageRecord = { id: number };

const languages = ["ภาษาไทย", "ภาษาอังกฤษ", "ภาษาจีน", "ภาษาญี่ปุ่น", "ภาษาเกาหลี", "ภาษาฝรั่งเศส", "ภาษาเยอรมัน", "ภาษาสเปน", "ภาษาอื่น ๆ"];
const levels = ["พื้นฐาน", "พอใช้", "ดี", "ดีมาก", "เชี่ยวชาญ"];

function SkillLevel({ label, name }: { label: string; name: string }) {
  return (
    <label className="field language-skill">
      <span>{label}</span>
      <select name={name} defaultValue="">
        <option value="" disabled>เลือกระดับ</option>
        {levels.map((level) => <option key={level}>{level}</option>)}
      </select>
    </label>
  );
}

function LanguageCard({ index, canDelete, onDelete }: { index: number; canDelete: boolean; onDelete: () => void }) {
  const cardRef = useRef<HTMLElement>(null);
  const prefix = `language${index + 1}`;

  const resetCard = () => {
    cardRef.current?.querySelectorAll<HTMLSelectElement>("select").forEach((select) => { select.value = ""; });
  };

  return (
    <section className="education-card language-card" ref={cardRef}>
      <header className="education-card-header">
        <h2>ภาษาลำดับที่ {index + 1}</h2>
        <div>
          <button type="button" className="secondary-button" onClick={resetCard}>รีเซ็ต</button>
          {canDelete && <button type="button" className="danger-text-button" onClick={onDelete}>ลบรายการ</button>}
        </div>
      </header>

      <label className="field language-select">
        <span>ภาษา <b aria-hidden="true">*</b></span>
        <select name={`${prefix}Name`} defaultValue="" required>
          <option value="" disabled>เลือกภาษา</option>
          {languages.map((language) => <option key={language}>{language}</option>)}
        </select>
      </label>

      <div className="language-levels">
        <SkillLevel label="การฟัง" name={`${prefix}Listening`} />
        <SkillLevel label="การพูด" name={`${prefix}Speaking`} />
        <SkillLevel label="การอ่าน" name={`${prefix}Reading`} />
        <SkillLevel label="การเขียน" name={`${prefix}Writing`} />
      </div>
    </section>
  );
}

export function LanguageForm({ onSubmit, saved, initialData = {} }: LanguageFormProps) {
  const initialCount = Math.max(1, ...[1, 2, 3, 4, 5].filter((index) => initialData[`language${index}Name`]));
  const [records, setRecords] = useState<LanguageRecord[]>(Array.from({ length: initialCount }, (_, id) => ({ id })));

  const addRecord = () => {
    setRecords((current) => current.length < 5 ? [...current, { id: Math.max(...current.map(({ id }) => id)) + 1 }] : current);
  };

  const removeRecord = (id: number) => {
    setRecords((current) => current.length > 1 ? current.filter((record) => record.id !== id) : current);
  };

  return (
    <form className="education-form language-form" onSubmit={onSubmit}>
      <h1 className="visually-hidden">ความสามารถทางภาษา</h1>
      {records.map((record, index) => <LanguageCard key={record.id} index={index} canDelete={records.length > 1} onDelete={() => removeRecord(record.id)} />)}

      {records.length < 5 && <button type="button" className="outline-add-button" onClick={addRecord}><span aria-hidden="true">＋</span> เพิ่มภาษา</button>}
      <small className="education-limit">เพิ่มข้อมูลได้สูงสุด 5 ภาษา</small>

      <div className="save-row">
        <button className="primary-button save-button" type="submit">บันทึก</button>
        {saved && <p className="save-message" role="status">บันทึกตัวอย่างเรียบร้อยแล้ว</p>}
      </div>
    </form>
  );
}
