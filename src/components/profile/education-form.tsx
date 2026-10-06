import { useEffect, useRef, useState, type FormEvent } from "react";

type EducationFormProps = {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  saved: boolean;
  initialData?: Record<string, unknown>;
};

type EducationStatus = "studying" | "graduated";
type EducationRecord = { id: number; status: EducationStatus };

const educationLevels = ["มัธยมศึกษา", "ประกาศนียบัตรวิชาชีพ (ปวช.)", "ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.)", "ปริญญาตรี", "ปริญญาโท", "ปริญญาเอก"];

function SelectField({ label, name, options, required = false }: { label: string; name: string; options: string[]; required?: boolean }) {
  return (
    <label className="field">
      <span>{label}{required && <b aria-hidden="true"> *</b>}</span>
      <select name={name} defaultValue="" required={required}>
        <option value="" disabled>เลือก{label}</option>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function EducationCard({ record, index, canDelete, onStatusChange, onReset, onDelete }: {
  record: EducationRecord;
  index: number;
  canDelete: boolean;
  onStatusChange: (status: EducationStatus) => void;
  onReset: () => void;
  onDelete: () => void;
}) {
  const prefix = `education${index + 1}`;
  const cardRef = useRef<HTMLElement>(null);

  const resetCard = () => {
    cardRef.current?.querySelectorAll<HTMLInputElement | HTMLSelectElement>("input:not([type='hidden']), select").forEach((control) => {
      control.value = "";
    });
    onReset();
  };

  return (
    <section className="education-card" ref={cardRef}>
      <header className="education-card-header">
        <h2>ลำดับ {index + 1}</h2>
        <div>
          <button type="button" className="secondary-button" onClick={resetCard}>รีเซ็ต</button>
          {canDelete && <button type="button" className="danger-text-button" onClick={onDelete}>ลบรายการ</button>}
        </div>
      </header>

      <fieldset className="education-status-field">
        <legend>สถานภาพการศึกษา</legend>
        <div className="segmented education-segmented">
          <button type="button" className={record.status === "studying" ? "selected" : ""} aria-pressed={record.status === "studying"} onClick={() => onStatusChange("studying")}>กำลังศึกษา</button>
          <button type="button" className={record.status === "graduated" ? "selected" : ""} aria-pressed={record.status === "graduated"} onClick={() => onStatusChange("graduated")}>จบการศึกษา</button>
        </div>
        <input type="hidden" name={`${prefix}Status`} value={record.status} />
      </fieldset>

      <div className="education-grid">
        <SelectField label="ระดับการศึกษา" name={`${prefix}Level`} options={educationLevels} required />
        <label className="field full">
          <span>สถานศึกษา <b aria-hidden="true">*</b></span>
          <input name={`${prefix}Institution`} placeholder="กรอกชื่อสถานศึกษา" required />
        </label>

        {record.status === "graduated" && (
          <SelectField label="หมวดการศึกษา" name={`${prefix}Category`} options={["สายสามัญ", "สายอาชีพ", "อุดมศึกษา", "อื่น ๆ"]} />
        )}
        <SelectField label="คณะ" name={`${prefix}Faculty`} options={["วิศวกรรมศาสตร์", "วิทยาศาสตร์", "บริหารธุรกิจ", "ศิลปศาสตร์", "นิเทศศาสตร์", "อื่น ๆ"]} required />
        {record.status === "graduated" && (
          <label className="field"><span>ชื่อปริญญา</span><input name={`${prefix}Degree`} placeholder="กรอกชื่อปริญญา" /></label>
        )}
        <label className="field"><span>สาขา <b aria-hidden="true">*</b></span><input name={`${prefix}Major`} placeholder="กรอกชื่อสาขา" required /></label>

        <SelectField
          label={record.status === "studying" ? "ปีที่คาดว่าจะจบ (พ.ศ.)" : "ปีที่สำเร็จการศึกษา (พ.ศ.)"}
          name={`${prefix}Year`}
          options={Array.from({ length: 30 }, (_, yearIndex) => String(2575 - yearIndex))}
          required
        />
        <label className="field"><span>เกรดเฉลี่ย</span><input name={`${prefix}Gpa`} type="number" min="0" max="4" step="0.01" placeholder="0.00" /></label>
      </div>
    </section>
  );
}

export function EducationForm({ onSubmit, saved, initialData = {} }: EducationFormProps) {
  const initialCount = Math.max(1, ...[1, 2, 3].filter((index) => initialData[`education${index}Institution`]));
  const [records, setRecords] = useState<EducationRecord[]>(Array.from({ length: initialCount }, (_, index) => ({ id: index, status: initialData[`education${index + 1}Status`] === "graduated" ? "graduated" : "studying" })));

  useEffect(() => {
    const hasData = [1, 2, 3].some((index) => initialData[`education${index}Institution`]);
    if (!hasData) return;
    const count = Math.max(1, ...[1, 2, 3].filter((index) => initialData[`education${index}Institution`]));
    setRecords(Array.from({ length: count }, (_, index) => ({
      id: index,
      status: initialData[`education${index + 1}Status`] === "graduated" ? "graduated" : "studying"
    })));
  }, [initialData]);

  const updateStatus = (id: number, status: EducationStatus) => {
    setRecords((current) => current.map((record) => record.id === id ? { ...record, status } : record));
  };

  const addRecord = () => {
    setRecords((current) => current.length < 3 ? [...current, { id: Math.max(...current.map(({ id }) => id)) + 1, status: "studying" }] : current);
  };

  const removeRecord = (id: number) => {
    setRecords((current) => current.length > 1 ? current.filter((record) => record.id !== id) : current);
  };

  return (
    <form className="education-form" onSubmit={onSubmit}>
      <h1 className="visually-hidden">ประวัติการศึกษา</h1>
      {records.map((record, index) => (
        <EducationCard
          key={record.id}
          record={record}
          index={index}
          canDelete={records.length > 1}
          onStatusChange={(status) => updateStatus(record.id, status)}
          onReset={() => updateStatus(record.id, "studying")}
          onDelete={() => removeRecord(record.id)}
        />
      ))}

      {records.length < 3 && <button type="button" className="outline-add-button" onClick={addRecord}><span aria-hidden="true">＋</span> เพิ่ม</button>}
      <small className="education-limit">เพิ่มข้อมูลได้สูงสุด 3 รายการ</small>

      <div className="save-row">
        <button className="primary-button save-button" type="submit">บันทึก</button>
        {saved && <p className="save-message" role="status">บันทึกข้อมูลเรียบร้อยแล้ว</p>}
      </div>
    </form>
  );
}
