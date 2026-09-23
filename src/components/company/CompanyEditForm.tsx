"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { CompanyLogo, Notice } from "@/components/ui/ui";
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
  });
  const [provinces, setProvinces] = useState<string[]>([company.province]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [notice, setNotice] = useState<NoticeState>(null);
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
      await api("/owner/company", { method: "PATCH", body: form });
      await reloadMe();
      router.push("/company");
    } catch (error) {
      setNotice({ tone: "error", text: errorMessage(error) });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
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
            <CompanyLogo company={profile} size={96} />
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
              className={styles.coverPreview}
              style={profile.coverImage ? { backgroundImage: `url("${profile.coverImage}")` } : undefined}
            />
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
              <img src={url} alt="" />
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
            {saving ? L("กำลังบันทึก...", "Saving...") : L("บันทึก", "Save")}
          </button>
        </div>
      </form>
    </div>
  );
}
