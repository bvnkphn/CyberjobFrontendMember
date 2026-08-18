import { useState, type FormEvent } from "react";

type OtherSkillsFormProps = {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  saved: boolean;
};

export function OtherSkillsForm({ onSubmit, saved }: OtherSkillsFormProps) {
  const [skills, setSkills] = useState([0]);

  const addSkill = () => {
    setSkills((current) => current.length < 5 ? [...current, Math.max(...current) + 1] : current);
  };

  const removeSkill = (id: number) => {
    setSkills((current) => current.length > 1 ? current.filter((skillId) => skillId !== id) : current);
  };

  return (
    <form className="other-skills-form" onSubmit={onSubmit}>
      <h1>ความสามารถอื่น ๆ</h1>

      <fieldset className="other-section specialty-section">
        <legend>ความสามารถเฉพาะทาง</legend>
        <p>เพิ่มเครื่องมือ เทคโนโลยี หรือทักษะที่คุณเชี่ยวชาญ</p>
        <div className="specialty-list">
          {skills.map((id, index) => (
            <div className="repeatable-row" key={id}>
              <input name={`specialty${index + 1}`} aria-label={`ความสามารถเฉพาะทางลำดับที่ ${index + 1}`} placeholder={index === 0 ? "เช่น ออกแบบ UX/UI, React, วิเคราะห์ข้อมูล" : "กรอกความสามารถเพิ่มเติม"} />
              {index > 0 && <button className="remove-row-button" type="button" onClick={() => removeSkill(id)} aria-label={`ลบความสามารถลำดับที่ ${index + 1}`}>×</button>}
            </div>
          ))}
          {skills.length < 5 && <button className="add-row-button" type="button" onClick={addSkill}><span aria-hidden="true">+</span> เพิ่มความสามารถ</button>}
        </div>
        <small>เพิ่มได้สูงสุด 5 รายการ</small>
      </fieldset>

      <fieldset className="other-section">
        <legend>ความสามารถในการขับขี่</legend>
        <p>เลือกได้มากกว่า 1 ประเภท</p>
        <div className="driving-options">
          <label><input type="checkbox" name="drivingMotorcycle" /> รถจักรยานยนต์</label>
          <label><input type="checkbox" name="drivingCar" /> รถยนต์</label>
          <label><input type="checkbox" name="drivingTruck" /> รถบรรทุก</label>
          <label><input type="checkbox" name="drivingOther" /> อื่น ๆ</label>
        </div>
      </fieldset>

      <fieldset className="other-section">
        <legend>ความเร็วเฉลี่ยในการพิมพ์</legend>
        <div className="typing-grid">
          <label className="field"><span>ภาษาไทย <small>(คำ/นาที)</small></span><input name="thaiTypingSpeed" type="number" min="0" placeholder="กรอกจำนวนคำ" /></label>
          <label className="field"><span>ภาษาอังกฤษ <small>(คำ/นาที)</small></span><input name="englishTypingSpeed" type="number" min="0" placeholder="กรอกจำนวนคำ" /></label>
        </div>
      </fieldset>

      <label className="field project-field">
        <span>โครงการ ผลงาน และประสบการณ์อื่น ๆ</span>
        <textarea name="projects" placeholder="อธิบายโครงการ ผลงาน รางวัล กิจกรรม หรือประสบการณ์อื่น ๆ ที่ต้องการให้ผู้ประกอบการเห็น" />
      </label>

      <div className="save-row other-skills-save-row">
        <button className="primary-button save-button" type="submit">บันทึก</button>
        {saved && <p className="save-message" role="status">บันทึกตัวอย่างเรียบร้อยแล้ว</p>}
      </div>
    </form>
  );
}
