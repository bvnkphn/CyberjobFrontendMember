import { useState, type FormEvent } from "react";

type DesiredJobFormProps = {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  saved: boolean;
};

const salaryOptions = [
  "ไม่ระบุ",
  "15,000 - 20,000 บาท",
  "20,001 - 30,000 บาท",
  "30,001 - 40,000 บาท",
  "40,001 - 50,000 บาท",
  "มากกว่า 50,000 บาท",
];

type RepeatableInputGroupProps = {
  label: string;
  hint: string;
  namePrefix: string;
  firstPlaceholder: string;
  addLabel: string;
};

function RepeatableInputGroup({ label, hint, namePrefix, firstPlaceholder, addLabel }: RepeatableInputGroupProps) {
  const [items, setItems] = useState([0]);

  const addItem = () => {
    setItems((current) => current.length < 3 ? [...current, Math.max(...current) + 1] : current);
  };

  const removeItem = (itemId: number) => {
    setItems((current) => current.length > 1 ? current.filter((id) => id !== itemId) : current);
  };

  return (
    <fieldset className="repeatable-group">
      <legend>
        {label} <span>({hint})</span> <b aria-hidden="true">*</b>
      </legend>

      {items.map((itemId, index) => (
        <div className="repeatable-row" key={itemId}>
          <input
            name={`${namePrefix}${index + 1}`}
            aria-label={`${label}ลำดับที่ ${index + 1}`}
            placeholder={index === 0 ? firstPlaceholder : `กรอก${label}`}
            required={index === 0}
          />
          {index > 0 && (
            <button className="remove-row-button" type="button" onClick={() => removeItem(itemId)} aria-label={`ลบ${label}ลำดับที่ ${index + 1}`}>
              ×
            </button>
          )}
        </div>
      ))}

      {items.length < 3 && (
        <button className="add-row-button" type="button" onClick={addItem}>
          <span aria-hidden="true">+</span> {addLabel}
        </button>
      )}
      <small className="repeatable-limit">เพิ่มได้สูงสุด 3 รายการ</small>
    </fieldset>
  );
}

export function DesiredJobForm({ onSubmit, saved }: DesiredJobFormProps) {
  return (
    <form className="profile-form desired-job-form" onSubmit={onSubmit} id="desired-job">
      <h1 className="visually-hidden">ลักษณะงานที่ต้องการ</h1>

      <div className="desired-job-fields">
        <RepeatableInputGroup label="ตำแหน่ง" hint="ระบุอย่างน้อย 1 ตำแหน่ง" namePrefix="desiredPosition" firstPlaceholder="เช่น นักออกแบบ UX/UI" addLabel="เพิ่มตำแหน่ง" />

        <RepeatableInputGroup label="ประเภทงาน" hint="ระบุอย่างน้อย 1 ประเภท" namePrefix="desiredJobType" firstPlaceholder="เช่น งานคอมพิวเตอร์/ไอที" addLabel="เพิ่มประเภทงาน" />

        <label className="field">
          <span>เงินเดือนที่ต้องการ</span>
          <select name="expectedSalary" defaultValue="">
            <option value="" disabled>เลือกช่วงเงินเดือน</option>
            {salaryOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>

        <label className="field">
          <span>สถานที่ปฏิบัติงานที่ต้องการ</span>
          <select name="workplacePreference" defaultValue="">
            <option value="" disabled>เลือกรูปแบบการทำงาน</option>
            <option>ทำงานที่สำนักงาน</option>
            <option>ทำงานแบบไฮบริด</option>
            <option>ทำงานออนไลน์</option>
          </select>
        </label>

        <label className="field">
          <span>วันที่สามารถเริ่มงานได้</span>
          <select name="availableStartDate" defaultValue="">
            <option value="" disabled>เลือกวันที่เริ่มงาน</option>
            <option>เริ่มงานได้ทันที</option>
            <option>ภายใน 7 วัน</option>
            <option>ภายใน 15 วัน</option>
            <option>ภายใน 30 วัน</option>
            <option>มากกว่า 30 วัน</option>
          </select>
        </label>
      </div>

      <div className="save-row">
        <button className="primary-button save-button" type="submit">บันทึก</button>
        {saved && <p className="save-message" role="status">บันทึกตัวอย่างเรียบร้อยแล้ว</p>}
      </div>
    </form>
  );
}
