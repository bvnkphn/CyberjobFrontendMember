import { useEffect, useRef, useState, type FormEvent } from "react";

type WorkExperienceFormProps = {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  saved: boolean;
  initialData?: Record<string, unknown>;
};

type WorkRecord = { id: number };

const months = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
const years = Array.from({ length: 45 }, (_, index) => String(2569 - index));

function PeriodSelects({ prefix, label }: { prefix: string; label: string }) {
  return (
    <fieldset className="period-field">
      <legend>{label} <b aria-hidden="true">*</b></legend>
      <div>
        <select name={`${prefix}Month`} aria-label={`${label} เดือน`} defaultValue="" required>
          <option value="" disabled>เลือกเดือน</option>
          {months.map((month) => <option key={month}>{month}</option>)}
        </select>
        <select name={`${prefix}Year`} aria-label={`${label} ปี`} defaultValue="" required>
          <option value="" disabled>เลือกปี พ.ศ.</option>
          {years.map((year) => <option key={year}>{year}</option>)}
        </select>
      </div>
    </fieldset>
  );
}

function WorkExperienceCard({ index, canDelete, onDelete }: { index: number; canDelete: boolean; onDelete: () => void }) {
  const cardRef = useRef<HTMLElement>(null);
  const prefix = `workExperience${index + 1}`;

  const resetCard = () => {
    cardRef.current?.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input, select, textarea").forEach((control) => {
      control.value = "";
    });
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

      <div className="experience-grid">
        <PeriodSelects prefix={`${prefix}Start`} label="วันที่เริ่ม" />
        <PeriodSelects prefix={`${prefix}End`} label="วันที่จบ" />

        <label className="field full"><span>ชื่อบริษัท <b aria-hidden="true">*</b></span><input name={`${prefix}Company`} placeholder="กรอกชื่อบริษัท" required /></label>
        <label className="field"><span>ตำแหน่งงาน <b aria-hidden="true">*</b></span><input name={`${prefix}Position`} placeholder="เช่น นักออกแบบ UX/UI" required /></label>
        <label className="field"><span>ประเภทงาน</span><select name={`${prefix}JobType`} defaultValue=""><option value="" disabled>เลือกประเภทงาน</option><option>ฝึกงาน</option><option>งานเต็มเวลา</option><option>งานพาร์ตไทม์</option><option>งานสัญญาจ้าง</option></select></label>
        <label className="field"><span>เงินเดือน</span><input name={`${prefix}Salary`} type="number" min="0" placeholder="กรอกเงินเดือน" /></label>
        <label className="field full"><span>รายละเอียดงาน</span><textarea name={`${prefix}Description`} placeholder="อธิบายหน้าที่ ความรับผิดชอบ และผลงานโดยย่อ" /></label>
      </div>
    </section>
  );
}

export function WorkExperienceForm({ onSubmit, saved, initialData = {} }: WorkExperienceFormProps) {
  const initialCount = Math.max(1, ...[1, 2, 3].filter((index) => initialData[`workExperience${index}Company`]));
  const [records, setRecords] = useState<WorkRecord[]>(Array.from({ length: initialCount }, (_, id) => ({ id })));

  useEffect(() => {
    const hasData = [1, 2, 3].some((index) => initialData[`workExperience${index}Company`]);
    if (!hasData) return;
    const count = Math.max(1, ...[1, 2, 3].filter((index) => initialData[`workExperience${index}Company`]));
    setRecords(Array.from({ length: count }, (_, id) => ({ id })));
  }, [initialData]);

  const addRecord = () => {
    setRecords((current) => current.length < 3 ? [...current, { id: Math.max(...current.map(({ id }) => id)) + 1 }] : current);
  };

  const removeRecord = (id: number) => {
    setRecords((current) => current.length > 1 ? current.filter((record) => record.id !== id) : current);
  };

  return (
    <form className="education-form experience-form" onSubmit={onSubmit}>
      <h1 className="visually-hidden">ประวัติการฝึกงานและการทำงาน</h1>
      {records.map((record, index) => <WorkExperienceCard key={record.id} index={index} canDelete={records.length > 1} onDelete={() => removeRecord(record.id)} />)}

      {records.length < 3 && <button type="button" className="outline-add-button" onClick={addRecord}><span aria-hidden="true">＋</span> เพิ่ม</button>}
      <small className="education-limit">เพิ่มข้อมูลได้สูงสุด 3 รายการ</small>

      <div className="save-row">
        <button className="primary-button save-button" type="submit">บันทึก</button>
        {saved && <p className="save-message" role="status">บันทึกข้อมูลเรียบร้อยแล้ว</p>}
      </div>
    </form>
  );
}
