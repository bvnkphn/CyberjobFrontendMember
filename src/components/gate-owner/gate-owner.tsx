"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { AUTH_API_URL } from "@/lib/config";
import { errorMessage, useOwner } from "@/lib/owner";
import { LanguageSwitcher } from "@/public-site/components/LanguageSwitcher";
import "./gate-owner.css";

type FormState = {
  companyName: string;
  registrationNumber: string;
  businessType: string;
  employeeRange: string;
  companyEmail: string;
  companyPhone: string;
  website: string;
  contactName: string;
  contactPosition: string;
  contactPhone: string;
  address: string;
  province: string;
};

/** ไฟล์จริงที่จะส่งขึ้น API – ร่างที่บันทึกในเครื่องเก็บได้แค่ข้อความ ไม่รวมไฟล์ */
type Documents = {
  certificate: File[];
  directorId: File[];
  workplace: File[];
  vat: File[];
};

const emptyForm: FormState = {
  companyName: "",
  registrationNumber: "",
  businessType: "",
  employeeRange: "",
  companyEmail: "",
  companyPhone: "",
  website: "",
  contactName: "",
  contactPosition: "",
  contactPhone: "",
  address: "",
  province: "",
};

const emptyDocuments: Documents = {
  certificate: [],
  directorId: [],
  workplace: [],
  vat: [],
};

const businessTypes = [
  "เทคโนโลยีสารสนเทศ",
  "การเงินและประกันภัย",
  "การผลิต",
  "การตลาดและสื่อ",
  "บริการวิชาชีพ",
  "อื่น ๆ",
];

const FALLBACK_PROVINCES = ["กรุงเทพมหานคร", "เชียงใหม่", "ขอนแก่น", "ชลบุรี", "นครราชสีมา", "ภูเก็ต", "สงขลา"];
const DRAFT_KEY = "ownerGateDraft";

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    building: <><path d="M3 21h18M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M9 7h1m4 0h1M9 11h1m4 0h1M9 15h1m4 0h1" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2" /></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 13h8M8 17h5" /></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></>,
    upload: <><path d="M12 16V4m0 0L7 9m5-5 5 5" /><path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" /></>,
    phone: <><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.2 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.68 2.8a2 2 0 0 1-.45 2.11L8.07 9.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.32 1.84.55 2.8.68A2 2 0 0 1 22 16.92Z" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    save: <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" /><path d="M17 21v-8H7v8M7 3v5h8" /></>,
    send: <><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    globe: <><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" /></>,
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function SectionTitle({ icon, marker, title, description }: { icon: string; marker: string; title: string; description: string }) {
  return <header className="gate-section-title"><span className="gate-section-icon"><Icon name={icon} /></span><span className="gate-marker">{marker}</span><span><strong>{title}</strong><small>{description}</small></span></header>;
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return <label className="gate-field"><span>{label}{required && <b aria-label="จำเป็น"> *</b>}</span>{children}{hint && <small>{hint}</small>}</label>;
}

function FileUpload({ label, hint, files, accept, multiple, required, onChange }: {
  label: string; hint: string; files: File[]; accept: string; multiple?: boolean; required?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return <div className="gate-upload"><div><strong>{label}{required && <b> *</b>}</strong><small>{hint}</small></div><label className="gate-upload-zone"><input type="file" accept={accept} multiple={multiple} onChange={onChange} /><Icon name="upload" /><span>{files.length ? files.map((file) => file.name).join(", ") : "อัปโหลดไฟล์"}</span></label></div>;
}

export function GateOwner() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [documents, setDocuments] = useState<Documents>(emptyDocuments);
  const [showConfirm, setShowConfirm] = useState(false);
  const [notice, setNotice] = useState("");
  const [sending, setSending] = useState(false);
  const [provinces, setProvinces] = useState(FALLBACK_PROVINCES);
  const { me, api, reloadMe } = useOwner();
  const router = useRouter();
  const status = me.company?.verificationStatus ?? "not_submitted";

  // บริษัทยืนยันแล้วไม่ต้องอยู่หน้า Gate
  useEffect(() => {
    if (status === "approved") router.replace("/dashboard");
  }, [status, router]);

  useEffect(() => {
    fetch(`${AUTH_API_URL}/meta/provinces`)
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((list: string[]) => Array.isArray(list) && list.length && setProvinces(list))
      .catch(() => undefined);

    // ถูกปฏิเสธ → เติมข้อมูลเดิมให้แก้ไขแล้วส่งใหม่
    if (me.company && status === "rejected") {
      setForm({
        companyName: me.company.name,
        registrationNumber: me.company.registrationNumber ?? "",
        businessType: me.company.businessType,
        employeeRange: me.company.employeeCount ?? "",
        companyEmail: me.company.email,
        companyPhone: me.company.phone,
        website: me.company.website,
        contactName: me.company.contactName ?? "",
        contactPosition: me.company.contactPosition ?? "",
        contactPhone: me.company.contactPhone ?? "",
        address: me.company.address,
        province: me.company.province,
      });
      return;
    }
    const stored = window.localStorage.getItem(DRAFT_KEY);
    if (!stored) return;
    try {
      const draft = JSON.parse(stored) as { form?: FormState };
      if (draft.form) setForm({ ...emptyForm, ...draft.form });
    } catch { window.localStorage.removeItem(DRAFT_KEY); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const completionItems = useMemo(() => [
    { label: "ข้อมูลบริษัท", done: Boolean(form.companyName && form.businessType) },
    { label: "เลขทะเบียนนิติบุคคล", done: /^\d{13}$/.test(form.registrationNumber) },
    { label: "อีเมลบริษัท", done: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.companyEmail) },
    { label: "หนังสือรับรองบริษัท", done: documents.certificate.length > 0 },
    { label: "บัตรประชาชนกรรมการ", done: documents.directorId.length > 0 },
    { label: "รูปสำนักงาน", done: documents.workplace.length > 0 },
    { label: "ภ.พ.20", done: documents.vat.length > 0 },
  ], [form, documents]);
  const completed = completionItems.filter((item) => item.done).length;
  const ready = completed === completionItems.length && Boolean(form.companyPhone && form.contactName && form.contactPosition && form.contactPhone && form.address && form.province);

  const update = (key: keyof FormState) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = key === "registrationNumber" ? event.target.value.replace(/\D/g, "").slice(0, 13) : event.target.value;
    setForm((current) => ({ ...current, [key]: value }));
  };

  const upload = (key: keyof Documents, maximum = 1) => (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.some((file) => file.size > 10 * 1024 * 1024)) {
      setNotice("ไฟล์ต้องมีขนาดไม่เกิน 10 MB");
      event.target.value = "";
      return;
    }
    const allowed = key === "workplace" ? ["image/png", "image/jpeg"] : ["image/png", "image/jpeg", "application/pdf"];
    if (files.some((file) => !allowed.includes(file.type))) {
      setNotice(key === "workplace" ? "รูปสำนักงานต้องเป็นไฟล์ JPG หรือ PNG" : "รองรับเฉพาะไฟล์ PDF, JPG หรือ PNG");
      event.target.value = "";
      return;
    }
    setDocuments((current) => ({ ...current, [key]: files.slice(0, maximum) }));
    setNotice("");
  };

  const saveDraft = () => {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ form }));
    setNotice("บันทึกฉบับร่างบนอุปกรณ์นี้แล้ว (ไฟล์เอกสารต้องแนบใหม่เมื่อกลับมากรอกต่อ)");
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!ready) { setNotice("กรุณากรอกข้อมูลจำเป็นและแนบเอกสารให้ครบก่อนส่งตรวจสอบ"); return; }
    setNotice("");
    setShowConfirm(true);
  };

  const confirmSubmission = async () => {
    const body = new FormData();
    for (const [key, value] of Object.entries(form)) {
      if (value) body.append(key, value);
    }
    for (const [key, files] of Object.entries(documents) as Array<[keyof Documents, File[]]>) {
      files.forEach((file) => body.append(key, file));
    }
    setSending(true);
    try {
      await api("/owner/company/verification", { body });
      window.localStorage.removeItem(DRAFT_KEY);
      setShowConfirm(false);
      await reloadMe();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setShowConfirm(false);
      setNotice(errorMessage(error));
    } finally {
      setSending(false);
    }
  };

  if (status === "approved") return null;

  if (status === "pending") {
    return <div className="gate-shell"><OwnerHeader /><main className="gate-success"><div className="gate-success-check"><Icon name="check" size={54} /></div><h1>ส่งข้อมูลสำเร็จ</h1><p>ข้อมูลบริษัทของคุณถูกส่งให้ทีมงานตรวจสอบแล้ว สถานะปัจจุบันของคุณคือ <strong>รอตรวจสอบ</strong></p><span className="gate-status-pill">สถานะ: รอตรวจสอบ</span><div className="gate-success-actions"><Link href="/dashboard">ไปหน้า Dashboard</Link><Link href="/company">ดูข้อมูลบริษัท</Link></div></main><OwnerFooter /></div>;
  }

  return <div className="gate-shell"><OwnerHeader /><main className="gate-main"><header className="gate-heading"><span>ยืนยันองค์กร</span><h1>กรอกข้อมูลบริษัท</h1><p>กรุณากรอกข้อมูลบริษัทและอัปโหลดเอกสารเพื่อยืนยันตัวตน</p></header><Steps />{status === "rejected" && <p className="gate-notice" role="alert">ข้อมูลบริษัทไม่ผ่านการตรวจสอบ กรุณาตรวจสอบข้อมูลและแนบเอกสารใหม่อีกครั้ง</p>}
    <div className="gate-layout"><form className="gate-form" onSubmit={submit} noValidate>
      <section className="gate-card"><SectionTitle icon="building" marker="A" title="ข้อมูลบริษัท" description="ข้อมูลพื้นฐานและประเภทธุรกิจของบริษัท" /><div className="gate-fields">
        <Field label="ชื่อบริษัท" required><input value={form.companyName} onChange={update("companyName")} placeholder="ชื่อบริษัทตามทะเบียน" required /></Field>
        <div className="gate-grid"><Field label="เลขทะเบียนนิติบุคคล" required hint="ตัวเลข 13 หลัก"><div className="gate-prefix"><span>#</span><input inputMode="numeric" value={form.registrationNumber} onChange={update("registrationNumber")} placeholder="0000000000000" required pattern="\d{13}" /></div></Field><Field label="ประเภทธุรกิจ" required><select value={form.businessType} onChange={update("businessType")} required><option value="">เลือกประเภทธุรกิจ</option>{businessTypes.map((item) => <option key={item}>{item}</option>)}</select></Field></div>
        <Field label="จำนวนพนักงาน"><select value={form.employeeRange} onChange={update("employeeRange")}><option value="">เลือกช่วงจำนวนพนักงาน</option><option>1–10 คน</option><option>11–50 คน</option><option>51–200 คน</option><option>มากกว่า 200 คน</option></select></Field>
      </div></section>
      <section className="gate-card"><SectionTitle icon="mail" marker="B" title="ข้อมูลติดต่อ" description="ช่องทางติดต่อของบริษัทและผู้ประสานงาน" /><div className="gate-fields gate-grid">
        <Field label="อีเมลบริษัท" required hint="แนะนำอีเมลโดเมนบริษัท"><input type="email" value={form.companyEmail} onChange={update("companyEmail")} placeholder="contact@company.com" required /></Field><Field label="เบอร์โทรศัพท์" required><input value={form.companyPhone} onChange={update("companyPhone")} placeholder="02-123-4567" required /></Field>
        <Field label="เว็บไซต์"><input type="url" value={form.website} onChange={update("website")} placeholder="https://www.company.com" /></Field><Field label="ชื่อผู้ติดต่อ" required><input value={form.contactName} onChange={update("contactName")} placeholder="ชื่อ-นามสกุล" required /></Field>
        <Field label="ตำแหน่งผู้ติดต่อ" required><input value={form.contactPosition} onChange={update("contactPosition")} placeholder="เช่น HR Manager" required /></Field><Field label="เบอร์โทรศัพท์ผู้ติดต่อ" required><input value={form.contactPhone} onChange={update("contactPhone")} placeholder="081-234-5678" required /></Field>
      </div></section>
      <section className="gate-card"><SectionTitle icon="pin" marker="C" title="ที่ตั้งบริษัท" description="ที่อยู่และตำแหน่งสำนักงานใหญ่" /><div className="gate-fields"><Field label="ที่อยู่" required><textarea value={form.address} onChange={update("address")} placeholder="เลขที่ ถนน ตำบล/แขวง อำเภอ/เขต" required /></Field><Field label="จังหวัด" required><select value={form.province} onChange={update("province")} required><option value="">เลือกจังหวัด</option>{provinces.map((item) => <option key={item}>{item}</option>)}</select></Field><div className="gate-map"><div className="gate-map-pin"><Icon name="pin" /></div><span>ตำแหน่งที่ตั้งบริษัท</span><small>เพิ่มลิงก์ Google Maps ได้ที่หน้าแก้ไขโปรไฟล์บริษัทหลังส่งข้อมูล</small></div></div></section>
      <section className="gate-card"><SectionTitle icon="file" marker="D" title="เอกสารยืนยันบริษัท" description="อัปโหลดเอกสารเพื่อยืนยันตัวตนของบริษัท" /><div className="gate-uploads"><FileUpload label="หนังสือรับรองบริษัท" hint="PDF/JPG/PNG · สูงสุด 10 MB" files={documents.certificate} accept=".pdf,.jpg,.jpeg,.png" required onChange={upload("certificate")} /><FileUpload label="บัตรประชาชนกรรมการ" hint="PDF/JPG/PNG · สูงสุด 10 MB" files={documents.directorId} accept=".pdf,.jpg,.jpeg,.png" required onChange={upload("directorId")} /><FileUpload label="รูปสำนักงาน" hint="JPG/PNG · 1–3 รูป" files={documents.workplace} accept=".jpg,.jpeg,.png" multiple required onChange={upload("workplace", 3)} /><FileUpload label="ภ.พ.20 (VAT)" hint="PDF/JPG/PNG · สูงสุด 10 MB" files={documents.vat} accept=".pdf,.jpg,.jpeg,.png" required onChange={upload("vat")} /></div></section>
      <section className="gate-secure"><span><Icon name="shield" /></span><div><strong>ข้อมูลของคุณปลอดภัย</strong><p>เอกสารทั้งหมดถูกใช้สำหรับการตรวจสอบและยืนยันตัวตนขององค์กรเท่านั้น</p><div className="gate-secure-tags"><span>หนังสือรับรองบริษัท</span><span>บัตรประชาชนกรรมการ</span><span>ภ.พ.20</span><span>เลขทะเบียนนิติบุคคล</span></div></div></section>
      {notice && <p className="gate-notice" role="status">{notice}</p>}<div className="gate-actions"><button className="gate-draft" type="button" onClick={saveDraft}><Icon name="save" />บันทึกฉบับร่าง</button><button className="gate-submit" type="submit" disabled={sending}><Icon name="send" />{sending ? "กำลังส่งข้อมูล..." : "บันทึกและส่งตรวจสอบ"}</button></div>
    </form><GateSummary form={form} items={completionItems} completed={completed} /></div>
  </main><OwnerFooter />{showConfirm && <ConfirmModal sending={sending} onClose={() => setShowConfirm(false)} onConfirm={confirmSubmission} />}</div>;
}

function OwnerHeader() {
  return (
    <header className="gate-topbar">
      <Link href="/" className="gate-logo"><span>CYBER</span>JOB</Link>
      <nav aria-label="เมนูผู้ประกอบการ" className="flex items-center gap-2">
        <LanguageSwitcher />
        <button type="button" aria-label="การแจ้งเตือน"><Icon name="bell" /></button>
        <button className="gate-avatar" type="button" aria-label="บัญชีบริษัท"><Icon name="building" /></button>
      </nav>
    </header>
  );
}

function Steps() {
  return <ol className="gate-steps"><li className="active"><b>1</b><span>ข้อมูลบริษัท</span></li><li><b>2</b><span>เอกสารยืนยัน</span></li><li><b>3</b><span>ตรวจสอบ</span></li><li><b>4</b><span>เสร็จสิ้น</span></li></ol>;
}

function GateSummary({ form, items, completed }: { form: FormState; items: { label: string; done: boolean }[]; completed: number }) {
  return <aside className="gate-side"><section className="gate-preview"><header><span><Icon name="building" /></span><div><strong>{form.companyName || "ชื่อบริษัทของคุณ"}</strong><small>{form.businessType || "ประเภทธุรกิจ"}</small></div></header><span className="gate-review">◷ รอตรวจสอบ</span><dl><div><dt><Icon name="mail" />อีเมล</dt><dd>{form.companyEmail || "—"}</dd></div><div><dt><Icon name="globe" />เว็บไซต์</dt><dd>{form.website || "—"}</dd></div><div><dt><Icon name="phone" />เบอร์โทร</dt><dd>{form.companyPhone || "—"}</dd></div><div><dt><Icon name="user" />ผู้ติดต่อ</dt><dd>{form.contactName || "—"}</dd></div><div><dt><Icon name="pin" />ที่อยู่</dt><dd>{form.address || "—"}</dd></div></dl><div className="gate-mini-map"><Icon name="pin" /></div></section><section className="gate-wait"><strong>◷ รอตรวจสอบ</strong><p>ข้อมูลของคุณจะถูกส่งให้ทีมงานตรวจสอบหลังยืนยัน</p></section><section className="gate-completion"><header><strong>ความครบถ้วนของข้อมูล</strong><span>{completed}/7</span></header><div className="gate-progress"><i style={{ width: `${completed / 7 * 100}%` }} /></div><ul>{items.map((item) => <li className={item.done ? "done" : ""} key={item.label}><span>{item.done ? "✓" : "–"}</span>{item.label}</li>)}</ul></section><section className="gate-privacy"><Icon name="shield" /><div><strong>เกี่ยวกับการยืนยันตัวตน</strong><p>ทีมงานใช้เวลาตรวจสอบประมาณ 1–3 วันทำการ</p></div></section></aside>;
}

function ConfirmModal({ onClose, onConfirm, sending }: { onClose: () => void; onConfirm: () => void; sending: boolean }) {
  return <div className="gate-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="gate-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title"><header><h2 id="confirm-title">ยืนยันการส่งข้อมูล</h2><button type="button" aria-label="ปิด" onClick={onClose}>×</button></header><div className="gate-modal-body"><div className="gate-warning">△</div><p>กรุณาตรวจสอบข้อมูลให้แน่ใจก่อนส่ง เนื่องจากจะไม่สามารถแก้ไขได้หลังจากส่งแล้ว</p><ul><li>✓ ข้อมูลบริษัทครบถ้วน</li><li>✓ เลขทะเบียนนิติบุคคล 13 หลัก</li><li>✓ อีเมลบริษัทถูกต้อง</li><li>✓ อัปโหลดเอกสารครบทุกฉบับ</li></ul></div><footer><button type="button" onClick={onClose}>ย้อนกลับ</button><button type="button" disabled={sending} onClick={onConfirm}>{sending ? "กำลังส่งข้อมูล..." : "ยืนยันและส่งตรวจสอบ"}</button></footer></section></div>;
}

function OwnerFooter() {
  return <footer className="gate-footer"><div><Link href="/" className="gate-logo gate-logo-footer"><span>CYBER</span>JOB</Link><p>เว็บประกาศงานสำหรับองค์กรทุกขนาด<br />เพื่อค้นหาผู้สมัครที่ใช่และสร้างทีม<br />ที่เติบโตไปพร้อมกับองค์กร</p></div><div className="gate-footer-links"><div><strong>ผู้ประกอบการ</strong><Link href="/candidates">ผู้สมัครทั้งหมด</Link><Link href="/candidates/bookmarks">ผู้สมัครที่บันทึก</Link><Link href="/candidates/responses">คำตอบผู้สมัคร</Link></div><div><strong>ตำแหน่งงาน</strong><Link href="/job-postings">ประกาศงาน</Link><Link href="/job-postings/create">สร้างประกาศงาน</Link></div><div><strong>ช่วยเหลือ</strong><Link href="/support">ติดต่อเรา</Link><Link href="/support#faq">คำถามที่พบบ่อย</Link><Link href="/settings">การตั้งค่าบัญชี</Link></div></div><small>Copyright © 2026 CYBERJOB Co, Ltd | All Rights Reserved.</small></footer>;
}
