"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { CompanyLogo, Notice, resolveUploadUrl } from "@/components/ui/ui";
import { AUTH_API_URL } from "@/lib/config";
import { COMPANY_TYPE_LABEL } from "@/lib/format";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { errorMessage, useOwner } from "@/lib/owner";
import type { CompanyProfile, CompanyType } from "@/lib/types";
import styles from "./Company.module.css";

const BUSINESS_TYPES = [
  "เทคโนโลยีสารสนเทศ",
  "การเงินและประกันภัย",
  "การผลิต",
  "การตลาดและสื่อ",
  "บริการวิชาชีพ",
  "ค้าปลีกและค้าส่ง",
  "โลจิสติกส์",
  "สุขภาพและการแพทย์",
  "การศึกษา",
  "อื่น ๆ",
];

const EMPLOYEE_RANGES = ["1–10 คน", "11–50 คน", "51–200 คน", "มากกว่า 200 คน"];

type NoticeState = { tone: "success" | "error"; text: string } | null;

/** แก้ไขโปรไฟล์บริษัท (Owner Feature 3.2) */
export function CompanyEditForm() {
  const { isEn } = useLanguage();
  const L = (th: string, en: string) => (isEn ? en : th);
  const router = useRouter();
  const { me, api, reloadMe } = useOwner();
  const company = me.company!;

  const [form, setForm] = useState({
    name: company.name,
    companyType: company.companyType,
    businessType: company.businessType,
    employeeCount: company.employeeCount ?? "",
    about: company.about,
    email: company.email,
    phone: company.phone,
    website: company.website,
    address: company.address,
    province: company.province,
    mapUrl: company.mapUrl ?? "",
    registrationNumber: company.registrationNumber ?? "",
    contactName: company.contactName ?? "",
    contactPosition: company.contactPosition ?? "",
    contactPhone: company.contactPhone ?? "",
    requestVerification: false,
  });
  const [provinces, setProvinces] = useState<string[]>([company.province]);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [notice, setNotice] = useState<NoticeState>(null);
  const [verifyNotice, setVerifyNotice] = useState<NoticeState>(null);
  const [imageNotice, setImageNotice] = useState<NoticeState>(null);
  const [profile, setProfile] = useState<CompanyProfile>(company);
  const galleryInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`${AUTH_API_URL}/meta/provinces`)
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((list: string[]) => Array.isArray(list) && list.length && setProvinces(list))
      .catch(() => undefined);
  }, []);

  const update = (key: keyof typeof form) => (event: { target: { value: string } }) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setNotice(null);
    try {
      const generalData = {
        name: form.name,
        companyType: form.companyType,
        businessType: form.businessType,
        employeeCount: form.employeeCount,
        about: form.about,
        email: form.email,
        phone: form.phone,
        website: form.website,
        address: form.address,
        province: form.province,
        mapUrl: form.mapUrl,
      };
      await api("/owner/company", { method: "PATCH", body: generalData });
      await reloadMe();
      router.push("/company");
    } catch (error) {
      setNotice({ tone: "error", text: errorMessage(error) });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  const submitVerificationRequest = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.registrationNumber.trim()) {
      setVerifyNotice({
        tone: "error",
        text: L("กรุณากรอกเลขทะเบียนนิติบุคคล 13 หลัก", "Please enter 13-digit registration number"),
      });
      return;
    }
    setVerifying(true);
    setVerifyNotice(null);
    try {
      const updated = await api<CompanyProfile>("/owner/company/request-verification", {
        method: "POST",
        body: {
          registrationNumber: form.registrationNumber.trim(),
          contactName: form.contactName.trim() || undefined,
          contactPosition: form.contactPosition.trim() || undefined,
          contactPhone: form.contactPhone.trim() || undefined,
        },
      });
      setProfile(updated);
      await reloadMe();
      setVerifyNotice({
        tone: "success",
        text: L(
          "ส่งข้อมูลให้ผู้ดูแลระบบ (Admin) ตรวจสอบและอนุมัติเรียบร้อยแล้ว สถานะบริษัทเปลี่ยนเป็น 'รอดำเนินการ (PENDING)'",
          "Verification details submitted to Admin for approval. Status changed to PENDING."
        ),
      });
    } catch (error) {
      setVerifyNotice({ tone: "error", text: errorMessage(error) });
    } finally {
      setVerifying(false);
    }
  };

  const uploadImage = async (slot: "logo" | "cover" | "gallery", files: FileList | null) => {
    if (!files?.length) return;
    setUploading(slot);
    setImageNotice(null);
    const body = new FormData();
    if (slot === "gallery") Array.from(files).forEach((file) => body.append("files", file));
    else body.append("file", files[0]);
    try {
      const next = await api<CompanyProfile>(`/owner/company/${slot}`, { method: slot === "gallery" ? "POST" : "PUT", body });
      setProfile(next);
      await reloadMe();
      setImageNotice({ tone: "success", text: L("อัปโหลดรูปเรียบร้อยแล้ว", "Image uploaded") });
    } catch (error) {
      setImageNotice({ tone: "error", text: errorMessage(error) });
    } finally {
      setUploading(null);
      if (galleryInput.current) galleryInput.current.value = "";
    }
  };

  const removeImage = async (path: string) => {
    setUploading(path);
    setImageNotice(null);
    try {
      const next = await api<CompanyProfile>(`/owner/company/${path}`, { method: "DELETE" });
      setProfile(next);
      await reloadMe();
    } catch (error) {
      setImageNotice({ tone: "error", text: errorMessage(error) });
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className={styles.page}>
      <Link href="/company" className={styles.back}>
        ‹ {L("กลับไปหน้าโปรไฟล์บริษัท", "Back to company profile")}
      </Link>
      <h1 className={styles.title}>{L("แก้ไขโปรไฟล์บริษัท", "Edit company profile")}</h1>

      {/* รูปภาพ – อัปโหลดทันทีที่เลือกไฟล์ */}
      <section className={styles.card}>
        <h2>{L("รูปภาพของบริษัท", "Company images")}</h2>
        {imageNotice && <Notice tone={imageNotice.tone}>{imageNotice.text}</Notice>}
        <div className={styles.imageGrid}>
          <div className={styles.imageSlot}>
            <span className={styles.label}>{L("โลโก้ / รูปโปรไฟล์", "Logo / profile image")}</span>
            <div className={styles.logoPreviewWrap}>
              <CompanyLogo company={profile} size={96} />
            </div>
            <div className={styles.imageActions}>
              <label className={styles.secondary}>
                {uploading === "logo" ? L("กำลังอัปโหลด...", "Uploading...") : L("อัปโหลดโลโก้", "Upload logo")}
                <input hidden type="file" accept="image/png,image/jpeg" onChange={(event) => uploadImage("logo", event.target.files)} />
              </label>
              {profile.logoUrl && (
                <button type="button" className={styles.linkDanger} onClick={() => removeImage("logo")}>
                  {L("ลบ", "Remove")}
                </button>
              )}
            </div>
          </div>

          <div className={styles.imageSlot}>
            <span className={styles.label}>{L("ภาพหน้าปก", "Cover image")}</span>
            <div
              className={`${styles.coverPreview} ${profile.coverImage ? styles.coverPreviewHasImage : ""}`}
              style={profile.coverImage ? { backgroundImage: `url("${resolveUploadUrl(profile.coverImage)}")` } : undefined}
            >
              {!profile.coverImage && (
                <div className={styles.coverEmptyNotice}>
                  <span style={{ fontSize: "24px" }}>🖼️</span>
                  <span>{L("ยังไม่มีภาพหน้าปก แนะนำขนาด 1200 × 300 px", "No cover image yet (Recommended 1200 × 300 px)")}</span>
                </div>
              )}
            </div>
            <div className={styles.imageActions}>
              <label className={styles.secondary}>
                {uploading === "cover" ? L("กำลังอัปโหลด...", "Uploading...") : L("อัปโหลดภาพหน้าปก", "Upload cover")}
                <input hidden type="file" accept="image/png,image/jpeg" onChange={(event) => uploadImage("cover", event.target.files)} />
              </label>
              {profile.coverImage && (
                <button type="button" className={styles.linkDanger} onClick={() => removeImage("cover")}>
                  {L("ลบ", "Remove")}
                </button>
              )}
            </div>
          </div>
        </div>

        <span className={styles.label}>
          {L("ภาพเพิ่มเติม (Gallery)", "Gallery images")} · {profile.gallery.length}/10
        </span>
        <div className={styles.gallery}>
          {profile.gallery.map((url, index) => (
            <figure key={url} className={styles.galleryItem}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resolveUploadUrl(url) ?? undefined} alt="" />
              <button type="button" aria-label={L("ลบรูป", "Remove image")} onClick={() => removeImage(`gallery/${index}`)}>
                ×
              </button>
            </figure>
          ))}
          {profile.gallery.length < 10 && (
            <label className={styles.galleryAdd}>
              {uploading === "gallery" ? L("กำลังอัปโหลด...", "Uploading...") : L("+ เพิ่มรูป", "+ Add images")}
              <input
                ref={galleryInput}
                hidden
                type="file"
                multiple
                accept="image/png,image/jpeg"
                onChange={(event) => uploadImage("gallery", event.target.files)}
              />
            </label>
          )}
        </div>
        <small className={styles.muted}>{L("รองรับ JPG และ PNG ขนาดไม่เกิน 5 MB ต่อรูป", "JPG or PNG, up to 5 MB each")}</small>
      </section>

      <form className={styles.card} onSubmit={submit} noValidate>
        <h2>{L("ข้อมูลบริษัท", "Company information")}</h2>
        {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}

        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span className={styles.label}>{L("ชื่อบริษัท", "Company name")} *</span>
            <input value={form.name} onChange={update("name")} maxLength={200} required />
          </label>

          <fieldset className={styles.field}>
            <legend className={styles.label}>{L("รูปแบบของบริษัท", "Company type")} *</legend>
            <div className={styles.segmented}>
              {(Object.keys(COMPANY_TYPE_LABEL) as CompanyType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  aria-pressed={form.companyType === type}
                  className={form.companyType === type ? styles.segmentActive : ""}
                  onClick={() => setForm((prev) => ({ ...prev, companyType: type }))}
                >
                  {isEn ? COMPANY_TYPE_LABEL[type].en : COMPANY_TYPE_LABEL[type].th}
                </button>
              ))}
            </div>
          </fieldset>

          <label className={styles.field}>
            <span className={styles.label}>{L("ประเภทของบริษัท (Industry)", "Industry category")} *</span>
            <select value={form.businessType} onChange={update("businessType")}>
              {[...new Set([form.businessType, ...BUSINESS_TYPES])].map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span className={styles.label}>{L("จำนวนพนักงาน", "Employees")}</span>
            <select value={form.employeeCount} onChange={update("employeeCount")}>
              <option value="">{L("ไม่ระบุ", "Not specified")}</option>
              {[...new Set([...(form.employeeCount ? [form.employeeCount] : []), ...EMPLOYEE_RANGES])].map((range) => (
                <option key={range}>{range}</option>
              ))}
            </select>
          </label>

          <label className={`${styles.field} ${styles.full}`}>
            <span className={styles.label}>{L("เกี่ยวกับบริษัท", "About the company")}</span>
            <textarea rows={6} maxLength={5000} value={form.about} onChange={update("about")} />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>{L("เบอร์โทร", "Phone")} *</span>
            <input value={form.phone} onChange={update("phone")} inputMode="tel" />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>{L("อีเมล", "Email")} *</span>
            <input type="email" value={form.email} onChange={update("email")} />
          </label>

          <label className={`${styles.field} ${styles.full}`}>
            <span className={styles.label}>{L("เว็บไซต์", "Website")}</span>
            <input type="url" value={form.website} onChange={update("website")} placeholder="https://" />
          </label>

          <label className={`${styles.field} ${styles.full}`}>
            <span className={styles.label}>{L("ที่อยู่ของบริษัท", "Address")} *</span>
            <textarea rows={3} maxLength={500} value={form.address} onChange={update("address")} />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>{L("จังหวัด", "Province")} *</span>
            <select value={form.province} onChange={update("province")}>
              {[...new Set([form.province, ...provinces])].map((province) => (
                <option key={province}>{province}</option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Google Maps Link</span>
            <input type="url" value={form.mapUrl} onChange={update("mapUrl")} placeholder="https://maps.google.com/?q=13.75,100.50" />
            <small className={styles.muted}>{L("ใส่ลิงก์ที่มีพิกัด เพื่อแสดงแผนที่ในหน้าโปรไฟล์", "Links with coordinates show a map on your profile")}</small>
          </label>
        </div>

        <div className={styles.formActions}>
          <Link href="/company" className={styles.secondary}>
            {L("ยกเลิก", "Cancel")}
          </Link>
          <button type="submit" className={styles.primary} disabled={saving}>
            {saving ? L("กำลังบันทึก...", "Saving...") : L("บันทึกข้อมูลทั่วไป", "Save company info")}
          </button>
        </div>
      </form>

      {/* ข้อมูลการยืนยันบริษัท (Company Verification Details) – ต้องส่งให้ Admin Approve ก่อน */}
      <form id="verification" className={`${styles.card} ${styles.spaced}`} onSubmit={submitVerificationRequest} noValidate>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", marginBottom: "8px" }}>
          <h2 style={{ margin: 0, fontSize: "16.5px", fontWeight: "800", color: "var(--color-navy-900, #0f172a)" }}>
            {L("ข้อมูลการยืนยันบริษัท (Verification details)", "Company verification details")}
          </h2>
          <div>
            {profile.verificationStatus === "pending" && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", padding: "6px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: "700" }}>
                ⏳ {L("รอดำเนินการ (รอ Admin ตรวจสอบ)", "Pending Admin Approval")}
              </span>
            )}
            {profile.verificationStatus === "approved" && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#ecfdf5", color: "#065f46", border: "1px solid #a7f3d0", padding: "6px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: "700" }}>
                ✓ {L("ยืนยันตัวตนแล้ว (Verified)", "Verified")}
              </span>
            )}
            {profile.verificationStatus === "rejected" && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca", padding: "6px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: "700" }}>
                ✕ {L("ไม่ผ่านการอนุมัติ (Rejected)", "Rejected")}
              </span>
            )}
            {profile.verificationStatus === "not_submitted" && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", padding: "6px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: "700" }}>
                ℹ️ {L("ยังไม่ส่งยืนยัน (Unverified)", "Unverified")}
              </span>
            )}
          </div>
        </div>

        <p style={{ fontSize: "13px", color: "var(--color-gray-600, #64748b)", margin: "0 0 16px", lineHeight: 1.6 }}>
          {L(
            "ข้อมูลในส่วนนี้เป็นข้อมูลนิติบุคคลสำหรับการตรวจสอบความถูกต้องและความน่าเชื่อถือ โดยข้อมูลนี้จะไม่ถูกบันทึกมีผลทันที แต่ต้องส่งให้ผู้ดูแลระบบ (Admin) ตรวจสอบและอนุมัติก่อน",
            "This corporate information is used for business verification and must be reviewed and approved by Admin before taking effect."
          )}
        </p>

        {verifyNotice && <Notice tone={verifyNotice.tone}>{verifyNotice.text}</Notice>}

        {profile.verificationStatus === "pending" && (
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "10px", padding: "14px 18px", marginBottom: "18px", color: "#92400e", fontSize: "13.5px", lineHeight: 1.6 }}>
            <strong>⏳ {L("คำขออยู่ระหว่างรอการตรวจสอบและอนุมัติจาก Admin", "Your verification request is pending review by Admin")}</strong>
            <p style={{ margin: "4px 0 0", fontSize: "12.5px" }}>
              {L(
                "ข้อมูลการยืนยันของคุณถูกส่งไปยังหลังบ้าน Admin เรียบร้อยแล้ว เมื่อทีมงานตรวจสอบข้อมูลถูกต้อง สถานะจะเปลี่ยนเป็น 'ยืนยันตัวตนแล้ว' โดยอัตโนมัติ",
                "Your details have been submitted to Admin. Once verified, your status will change to Verified."
              )}
            </p>
          </div>
        )}

        {profile.verificationStatus === "approved" && (
          <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "10px", padding: "14px 18px", marginBottom: "18px", color: "#065f46", fontSize: "13.5px", lineHeight: 1.6 }}>
            <strong>✓ {L("บริษัทได้รับการตรวจสอบและอนุมัติเรียบร้อยแล้ว", "Company is approved and verified")}</strong>
            <p style={{ margin: "4px 0 0", fontSize: "12.5px" }}>
              {L(
                "หากท่านต้องการเปลี่ยนแปลงเลขทะเบียนนิติบุคคลหรือข้อมูลผู้ติดต่อ การส่งข้อมูลใหม่จะเปลี่ยนสถานะเป็น 'รอดำเนินการ' เพื่อรอให้ Admin ตรวจสอบอนุมัติใหม่อีกครั้ง",
                "If you need to update registration or contact details, submitting will change your status to PENDING for Admin re-approval."
              )}
            </p>
          </div>
        )}

        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span className={styles.label}>{L("เลขทะเบียนนิติบุคคล (13 หลัก)", "Registration no. (13 digits)")} *</span>
            <input
              value={form.registrationNumber}
              onChange={update("registrationNumber")}
              maxLength={20}
              placeholder={L("เช่น 0105560000000", "e.g. 0105560000000")}
              disabled={verifying || profile.verificationStatus === "pending"}
              required
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>{L("ชื่อ-นามสกุล ผู้ติดต่อ", "Contact person name")}</span>
            <input
              value={form.contactName}
              onChange={update("contactName")}
              maxLength={120}
              placeholder={L("เช่น สมชาย ใจดี", "e.g. Somchai Jaidee")}
              disabled={verifying || profile.verificationStatus === "pending"}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>{L("ตำแหน่งผู้ติดต่อ", "Contact position")}</span>
            <input
              value={form.contactPosition}
              onChange={update("contactPosition")}
              maxLength={100}
              placeholder={L("เช่น HR Manager / กรรมการผู้จัดการ", "e.g. HR Manager")}
              disabled={verifying || profile.verificationStatus === "pending"}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>{L("เบอร์โทรผู้ติดต่อ", "Contact phone")}</span>
            <input
              value={form.contactPhone}
              onChange={update("contactPhone")}
              inputMode="tel"
              placeholder={L("เช่น 081-234-5678", "e.g. 081-234-5678")}
              disabled={verifying || profile.verificationStatus === "pending"}
            />
          </label>
        </div>

        <div className={styles.formActions} style={{ marginTop: "22px", justifyContent: "flex-end" }}>
          <button
            type="submit"
            className={styles.primary}
            disabled={verifying || profile.verificationStatus === "pending"}
            style={{
              background: profile.verificationStatus === "pending" ? "#94a3b8" : "var(--color-navy-900, #0f172a)",
              cursor: profile.verificationStatus === "pending" ? "not-allowed" : "pointer"
            }}
          >
            {verifying
              ? L("กำลังส่งข้อมูล...", "Submitting...")
              : profile.verificationStatus === "pending"
              ? L("⏳ อยู่ระหว่างรอ Admin ตรวจสอบ", "Pending Admin Approval")
              : profile.verificationStatus === "approved"
              ? L("📤 ส่งขอตรวจสอบและอนุมัติใหม่", "Submit for Re-approval")
              : L("📤 ส่งข้อมูลให้ Admin ตรวจสอบและอนุมัติ", "Submit for Admin Approval")}
          </button>
        </div>
      </form>
    </div>
  );
}
