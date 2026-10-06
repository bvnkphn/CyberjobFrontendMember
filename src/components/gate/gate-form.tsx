"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/public-site/auth/AuthProvider";
import { getProfile, saveGate, skipGate } from "@/lib/member-api";
import "../profile/profile-editor.css";
import "./gate.css";

const jobCategories = [
  "งานคอมพิวเตอร์/ไอที",
  "งานออกแบบ/กราฟิก",
  "งานการตลาด/ประชาสัมพันธ์",
  "งานบัญชี/การเงิน",
  "งานวิศวกรรม",
  "งานทรัพยากรบุคคล",
  "งานขาย/บริการลูกค้า",
  "งานอื่น ๆ",
];

export function GateForm() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [privacy, setPrivacy] = useState<"public" | "private">("public");
  const [status, setStatus] = useState<"idle" | "saved" | "skipped">("idle");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getProfile().then((profile) => {
      const form = document.querySelector<HTMLFormElement>(".gate-card");
      if (!form) return;
      const values: Record<string, unknown> = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        address: profile.address,
        jobCategory1: profile.desiredJobCategories?.[0],
        jobCategory2: profile.desiredJobCategories?.[1],
      };
      for (const [name, value] of Object.entries(values)) {
        const field = form.elements.namedItem(name);
        if ((field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement) && value != null) field.value = String(value);
      }
      setPrivacy(profile.privacy);
    }).catch((reason) => {
      setError(reason instanceof Error ? reason.message : "โหลดข้อมูลโปรไฟล์ไม่สำเร็จ");
    }).finally(() => setLoadingProfile(false));
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");
    setStatus("idle");
    const formData = new FormData(event.currentTarget);
    const rawCat1 = formData.get("jobCategory1");
    const rawCat2 = formData.get("jobCategory2");
    const categories = [rawCat1, rawCat2].filter((c): c is string => typeof c === "string" && c.trim().length > 0);
    if (categories.length === 0) {
      categories.push("งานคอมพิวเตอร์/ไอที");
    }
    const finalPrivacy = (formData.get("privacy") as "public" | "private") || privacy || "public";
    try {
      await saveGate({
        firstName: String(formData.get("firstName") || "").trim(),
        lastName: String(formData.get("lastName") || "").trim(),
        address: String(formData.get("address") || "").trim(),
        desiredJobCategories: categories,
        privacy: finalPrivacy,
      });
      setStatus("saved");
      await refreshUser();
      router.replace("/");
    } catch (error) {
      setError(error instanceof Error ? error.message : "บันทึกข้อมูลไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  };

  const skip = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError("");
    setStatus("idle");
    try {
      await skipGate();
      setStatus("skipped");
      await refreshUser();
      router.replace("/");
    } catch (error) {
      setError(error instanceof Error ? error.message : "ข้ามขั้นตอนไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="gate-page">
      <div className="gate-layout">
        <section className="gate-intro">
          <p className="gate-eyebrow">ตั้งค่าโปรไฟล์เริ่มต้น</p>
          <h1>ใกล้สำเร็จแล้ว</h1>
          <p>กรอกข้อมูลสั้น ๆ เพื่อให้ CyberJob แนะนำงานที่เหมาะกับคุณได้ดียิ่งขึ้น</p>
          <div className="gate-steps" aria-label="ขั้นตอนการสมัคร">
            <span className="done">1</span><i /><span className="active">2</span>
            <strong>สร้างบัญชีแล้ว · ตั้งค่าโปรไฟล์</strong>
          </div>
        </section>

        <form className="gate-card" onSubmit={submit}>
        <header className="gate-card-heading"><div><span>ใช้เวลาประมาณ 2 นาที</span><h2>ข้อมูลสำหรับแนะนำงาน</h2></div><p><b>*</b> ข้อมูลที่จำเป็น</p></header>
        <div className="gate-grid">
          <label className="field">
            <span>ชื่อ <b aria-hidden="true">*</b></span>
            <input name="firstName" autoComplete="given-name" placeholder="กรอกชื่อ" required />
          </label>
          <label className="field">
            <span>นามสกุล <b aria-hidden="true">*</b></span>
            <input name="lastName" autoComplete="family-name" placeholder="กรอกนามสกุล" required />
          </label>

          <label className="field full">
            <span>ที่อยู่ปัจจุบัน <b aria-hidden="true">*</b></span>
            <textarea name="address" autoComplete="street-address" placeholder="กรอกบ้านเลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด และรหัสไปรษณีย์" required />
          </label>

          <fieldset className="gate-fieldset full">
            <legend>ประเภทงานที่ต้องการ <span>(เลือกได้สูงสุด 2 ประเภท)</span> <b aria-hidden="true">*</b></legend>
            <div className="gate-job-grid">
              <select name="jobCategory1" aria-label="ประเภทงานที่ต้องการลำดับที่ 1" defaultValue="" required>
                <option value="" disabled>เลือกประเภทงานหลัก</option>
                {jobCategories.map((category) => <option key={category}>{category}</option>)}
              </select>
              <select name="jobCategory2" aria-label="ประเภทงานที่ต้องการลำดับที่ 2" defaultValue="">
                <option value="">ไม่เลือกประเภทงานเพิ่มเติม</option>
                {jobCategories.map((category) => <option key={category}>{category}</option>)}
              </select>
            </div>
          </fieldset>

          <fieldset className="gate-fieldset full">
            <legend>ใครบ้างที่สามารถเห็นโปรไฟล์ของคุณ</legend>
            <div className="privacy-options">
              <label className={privacy === "public" ? "selected" : ""}>
                <input type="radio" name="privacy" value="public" checked={privacy === "public"} onChange={() => setPrivacy("public")} />
                <span><strong>สาธารณะ</strong><small>ผู้ประกอบการสามารถค้นหาและติดต่อคุณได้</small></span>
              </label>
              <label className={privacy === "private" ? "selected" : ""}>
                <input type="radio" name="privacy" value="private" checked={privacy === "private"} onChange={() => setPrivacy("private")} />
                <span><strong>ส่วนตัว</strong><small>แสดงโปรไฟล์เฉพาะบริษัทที่คุณสมัครงาน</small></span>
              </label>
            </div>
          </fieldset>
        </div>

        <footer className="gate-actions">
          <button className="primary-button gate-submit" type="submit" disabled={submitting || loadingProfile}>{submitting ? "กำลังบันทึก..." : "บันทึกและดำเนินการต่อ"}</button>
          <button className="gate-skip" type="button" onClick={skip} disabled={submitting || loadingProfile}>ข้ามขั้นตอนนี้</button>
          {loadingProfile && <p role="status">กำลังโหลดข้อมูลโปรไฟล์...</p>}
          {error && <p className="gate-error" role="alert">{error}</p>}
          {status !== "idle" && <p role="status">{status === "saved" ? "บันทึกข้อมูลเรียบร้อยแล้ว" : "ข้ามขั้นตอนเรียบร้อยแล้ว"}</p>}
        </footer>
        </form>
      </div>
    </main>
  );
}
