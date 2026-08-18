import type { FormEvent } from "react";

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

export function DesiredJobForm({ onSubmit, saved }: DesiredJobFormProps) {
  return (
    <form className="profile-form desired-job-form" onSubmit={onSubmit} id="desired-job">
      <h1 className="visually-hidden">ลักษณะงานที่ต้องการ</h1>

      <div className="desired-job-fields">
        <fieldset className="repeatable-group">
          <legend>
            ตำแหน่ง <span>(ระบุอย่างน้อย 1 ตำแหน่ง)</span> <b aria-hidden="true">*</b>
          </legend>
          <input name="desiredPosition1" placeholder="เช่น นักออกแบบ UX/UI" required />
          <input name="desiredPosition2" aria-label="ตำแหน่งที่ต้องการลำดับที่ 2" placeholder="+ เพิ่มตำแหน่ง" />
          <input name="desiredPosition3" aria-label="ตำแหน่งที่ต้องการลำดับที่ 3" placeholder="+ เพิ่มตำแหน่ง" />
        </fieldset>

        <fieldset className="repeatable-group">
          <legend>
            ประเภทงาน <span>(ระบุอย่างน้อย 1 ประเภท)</span> <b aria-hidden="true">*</b>
          </legend>
          <input name="desiredJobType1" placeholder="เช่น งานคอมพิวเตอร์/ไอที" required />
          <input name="desiredJobType2" aria-label="ประเภทงานที่ต้องการลำดับที่ 2" placeholder="+ เพิ่มประเภทงาน" />
          <input name="desiredJobType3" aria-label="ประเภทงานที่ต้องการลำดับที่ 3" placeholder="+ เพิ่มประเภทงาน" />
        </fieldset>

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
