"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/admin/auth";
import { CheckIcon, VideoIcon } from "../icons";
import styles from "./TutorialsAdmin.module.css";

export interface TutorialItem {
  id: string;
  orderIndex: number;
  title: string;
  titleEn: string;
  videoUrl: string;
  duration: string;
  updatedAt?: string;
}

const DEFAULT_ITEMS: TutorialItem[] = [
  {
    id: "tutorial_01",
    orderIndex: 0,
    title: "เริ่มต้นใช้งานและยืนยันบริษัท",
    titleEn: "Getting started & company verification",
    videoUrl: "",
    duration: "3:20",
  },
  {
    id: "tutorial_02",
    orderIndex: 1,
    title: "สร้างประกาศงานและตั้งคำถามคัดกรอง",
    titleEn: "Posting a job with screening questions",
    videoUrl: "",
    duration: "4:45",
  },
  {
    id: "tutorial_03",
    orderIndex: 2,
    title: "ค้นหาผู้สมัครและอ่าน Matching Score",
    titleEn: "Finding candidates & reading the Matching Score",
    videoUrl: "",
    duration: "3:05",
  },
  {
    id: "tutorial_04",
    orderIndex: 3,
    title: "ติดตามคำตอบและคำเชิญ",
    titleEn: "Tracking responses & invitations",
    videoUrl: "",
    duration: "2:30",
  },
  {
    id: "tutorial_05",
    orderIndex: 4,
    title: "อัปเกรดแพ็กเกจและชำระเงิน",
    titleEn: "Upgrading your package",
    videoUrl: "",
    duration: "2:10",
  },
];

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  const match = trimmed.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
  if (match && match[1]) {
    return `https://www.youtube-nocookie.com/embed/${match[1]}`;
  }
  return null;
}

export function TutorialsAdminView() {
  const { adminFetch } = useAdminAuth();
  const [items, setItems] = useState<TutorialItem[]>(DEFAULT_ITEMS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        const res = await adminFetch("/admin/settings/tutorials");
        if (res.ok) {
          const data: TutorialItem[] = await res.json();
          if (active && Array.isArray(data) && data.length > 0) {
            setItems(data);
          }
        }
      } catch (err) {
        console.error("Failed to load tutorial videos:", err);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, [adminFetch]);

  const handleChange = (id: string, field: "videoUrl" | "duration", value: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const togglePreview = (id: string) => {
    setPreviewOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await adminFetch("/admin/settings/tutorials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) {
        throw new Error("บันทึกข้อมูลไม่สำเร็จ");
      }
      setToastMessage("บันทึกข้อมูลวิดีโอแนะนำการใช้งานเรียบร้อยแล้ว");
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      alert(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>จัดการวิดีโอแนะนำการใช้งาน (Tutorials)</h1>
          <p>
            ใส่ลิงก์คลิปวิดีโอสอนการใช้งานระบบสำหรับผู้ประกอบการ (YouTube)
            ที่จะนำไปแสดงในหน้าศูนย์ช่วยเหลือ
          </p>
        </div>
        <a
          href="https://cyberjob.asia/support/tutorials"
          target="_blank"
          rel="noreferrer"
          className={styles.viewSiteBtn}
        >
          <span>เปิดดูหน้าจริงบนเว็บไซต์</span>
          <span>↗</span>
        </a>
      </header>

      <div className={styles.infoBanner}>
        <div className={styles.infoIcon}>💡</div>
        <div className={styles.infoText}>
          <h3>คำแนะนำการใส่คลิปวิดีโอ</h3>
          <p>
            ท่านสามารถคัดลอกลิงก์วิดีโอ YouTube ได้ทุกรูปแบบ เช่น{" "}
            <code>https://www.youtube.com/watch?v=...</code> หรือ{" "}
            <code>https://youtu.be/...</code> ระบบจะทำการแปลงเป็น Embed Player
            ให้อัตโนมัติ หากยังไม่ได้ระบุลิงก์
            หน้าเว็บจะแสดงป้ายกล่องข้อความ &quot;วิดีโอกำลังจัดทำ&quot; ให้ผู้ใช้ทราบ
          </p>
        </div>
      </div>

      {loading ? (
        <p style={{ color: "#64748b", padding: "20px 0" }}>กำลังโหลดข้อมูล...</p>
      ) : (
        <div className={styles.list}>
          {items.map((item, idx) => {
            const hasVideo = !!item.videoUrl && item.videoUrl.trim() !== "";
            const embed = getYouTubeEmbedUrl(item.videoUrl);
            const isPreviewing = previewOpen[item.id] ?? false;

            return (
              <div key={item.id} className={styles.card}>
                <div className={styles.cardHead}>
                  <div className={styles.cardTitleWrap}>
                    <span className={styles.orderBadge}>{idx + 1}</span>
                    <div>
                      <h2 className={styles.cardTitle}>{item.title}</h2>
                      <p className={styles.cardSubtitle}>{item.titleEn}</p>
                    </div>
                  </div>
                  <div>
                    {hasVideo ? (
                      <span
                        className={`${styles.statusBadge} ${styles.statusBadgeActive}`}
                      >
                        ● มีคลิปวิดีโอแล้ว
                      </span>
                    ) : (
                      <span
                        className={`${styles.statusBadge} ${styles.statusBadgeEmpty}`}
                      >
                        ○ ยังไม่มีคลิป (กำลังจัดทำ)
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor={`url-${item.id}`}>
                      ลิงก์ YouTube Video URL
                    </label>
                    <input
                      id={`url-${item.id}`}
                      className={styles.input}
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=... หรือ https://youtu.be/..."
                      value={item.videoUrl}
                      onChange={(e) =>
                        handleChange(item.id, "videoUrl", e.target.value)
                      }
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor={`dur-${item.id}`}>
                      ความยาวคลิป (นาที:วินาที)
                    </label>
                    <input
                      id={`dur-${item.id}`}
                      className={styles.input}
                      type="text"
                      placeholder="เช่น 3:20"
                      value={item.duration}
                      onChange={(e) =>
                        handleChange(item.id, "duration", e.target.value)
                      }
                    />
                  </div>
                </div>

                {hasVideo && (
                  <div style={{ marginTop: "10px" }}>
                    <button
                      type="button"
                      onClick={() => togglePreview(item.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#0284c7",
                        fontWeight: 600,
                        fontSize: "13px",
                        cursor: "pointer",
                        padding: 0,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <VideoIcon size={14} />
                      {isPreviewing
                        ? "ซ่อนตัวอย่างคลิป"
                        : "คลิกเพื่อดูตัวอย่างคลิปวิดีโอ (Live Preview)"}
                    </button>

                    {isPreviewing && (
                      <div className={styles.previewSection}>
                        {embed ? (
                          <iframe
                            className={styles.previewIframe}
                            src={embed}
                            title={item.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <div
                            style={{
                              color: "#ef4444",
                              padding: "20px",
                              textAlign: "center",
                              fontSize: "13px",
                            }}
                          >
                            ⚠️ รูปแบบลิงก์ไม่ถูกต้อง
                            กรุณาระบุเป็นลิงก์วิดีโอของ YouTube
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className={styles.actionBar}>
        <p className={styles.actionNote}>
          เมื่อกดบันทึก ข้อมูลวิดีโอจะอัปเดตไปยังหน้า{" "}
          <strong>/support/tutorials</strong> ของเว็บไซต์ทันที
        </p>
        <button
          type="button"
          className={styles.saveBtn}
          onClick={handleSave}
          disabled={saving || loading}
        >
          {saving ? (
            "กำลังบันทึก..."
          ) : (
            <>
              <CheckIcon size={18} />
              บันทึกการเปลี่ยนแปลงทั้งหมด
            </>
          )}
        </button>
      </div>

      {toastMessage && (
        <div className={styles.toast} role="status">
          <CheckIcon size={18} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
