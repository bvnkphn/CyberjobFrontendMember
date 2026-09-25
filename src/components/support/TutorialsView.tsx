"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import styles from "./Tutorials.module.css";

function embedUrl(url: string | undefined | null): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
  return match ? `https://www.youtube-nocookie.com/embed/${match[1]}` : null;
}

const DEFAULT_TUTORIALS = [
  {
    id: "tutorial_01",
    title: ["เริ่มต้นใช้งานและยืนยันบริษัท", "Getting started & company verification"],
    duration: "3:20",
    steps: [
      ["กรอกข้อมูลบริษัทและผู้ติดต่อในหน้า Gate", "Fill in company and contact details on the Gate page"],
      ["แนบหนังสือรับรอง บัตรประชาชนกรรมการ รูปสำนักงาน และ ภ.พ.20", "Attach the certificate, director ID, office photos and VAT form"],
      ["รอทีมงานตรวจสอบ 1–3 วันทำการ", "Wait 1–3 business days for review"],
    ],
    link: "/company",
  },
  {
    id: "tutorial_02",
    title: ["สร้างประกาศงานและตั้งคำถามคัดกรอง", "Posting a job with screening questions"],
    duration: "4:45",
    steps: [
      ["ไปที่ ตำแหน่งงาน › สร้างประกาศงาน", "Go to Job postings › Create job posting"],
      ["กรอกรายละเอียดงาน เงินเดือน และทักษะที่ต้องการ", "Enter the description, salary and required skills"],
      ["เพิ่มคำถามคัดกรอง แล้วกดบันทึกแบบร่างหรือเผยแพร่", "Add screening questions, then save a draft or publish"],
    ],
    link: "/job-postings/create",
  },
  {
    id: "tutorial_03",
    title: ["ค้นหาผู้สมัครและอ่าน Matching Score", "Finding candidates & reading the Matching Score"],
    duration: "3:05",
    steps: [
      ["ใช้ตัวกรองประสบการณ์ ทักษะ และ Resume Score", "Filter by experience, skills and Resume Score"],
      ["เปิดรายละเอียดผู้สมัครเพื่อดูเหตุผลของคะแนน", "Open a candidate to see why they match"],
      ["บันทึกผู้สมัครที่สนใจหรือส่งคำเชิญให้สมัครงาน", "Bookmark candidates or invite them to apply"],
    ],
    link: "/candidates",
  },
  {
    id: "tutorial_04",
    title: ["ติดตามคำตอบและคำเชิญ", "Tracking responses & invitations"],
    duration: "2:30",
    steps: [
      ["ดูคำตอบคำถามคัดกรองของผู้สมัครแต่ละคน", "Read each applicant's screening answers"],
      ["ติดตามสถานะคำเชิญ ตอบรับ / รอตอบกลับ / ปฏิเสธ", "Track invitations: accepted, awaiting or declined"],
    ],
    link: "/candidates/responses",
  },
  {
    id: "tutorial_05",
    title: ["อัปเกรดแพ็กเกจและชำระเงิน", "Upgrading your package"],
    duration: "2:10",
    steps: [
      ["เลือกแพ็กเกจ GOLD หรือ PLATINUM", "Choose GOLD or PLATINUM"],
      ["ชำระผ่าน PromptPay หรือโอนเงิน แล้วแนบหลักฐาน", "Pay via PromptPay or bank transfer and attach the proof"],
    ],
    link: "/packages",
  },
];

/** วิดีโอแนะนำการใช้งาน (Owner Feature 6.3) */
export function TutorialsView() {
  const { isEn } = useLanguage();
  const L = (th: string, en: string) => (isEn ? en : th);
  const [active, setActive] = useState(0);
  const [videoMap, setVideoMap] = useState<Record<string, { videoUrl: string; duration?: string }>>({});

  useEffect(() => {
    let mounted = true;
    const adminApi = process.env.NEXT_PUBLIC_ADMIN_API_URL || "https://api-admin.cyberjob.asia/api/v1";
    fetch(`${adminApi}/admin/settings/tutorials`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: any[]) => {
        if (!mounted || !Array.isArray(data)) return;
        const map: Record<string, { videoUrl: string; duration?: string }> = {};
        for (const item of data) {
          if (item.id) {
            map[item.id] = {
              videoUrl: item.videoUrl || "",
              duration: item.duration || "",
            };
          }
        }
        setVideoMap(map);
      })
      .catch((err) => {
        console.warn("Could not fetch tutorial videos from API:", err);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const current = DEFAULT_TUTORIALS[active];
  const currentVideoUrl = videoMap[current.id]?.videoUrl || "";
  const video = embedUrl(currentVideoUrl);

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <h1>{L("วิดีโอแนะนำการใช้งาน", "Tutorial videos")}</h1>
        <p>{L("เรียนรู้การใช้งาน CyberJob สำหรับผู้ประกอบการทีละขั้นตอน", "Learn CyberJob for employers step by step")}</p>
      </header>

      <div className={styles.layout}>
        <section className={styles.player}>
          {video ? (
            <iframe
              src={video}
              title={L(...(current.title as [string, string]))}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          ) : (
            <div className={styles.placeholder}>
              <span aria-hidden>▶</span>
              <strong>{L("วิดีโอกำลังจัดทำ", "Video coming soon")}</strong>
              <small>{L("ระหว่างนี้ทำตามขั้นตอนด้านล่างได้เลย", "Follow the steps below in the meantime")}</small>
            </div>
          )}
          <div className={styles.info}>
            <h2>{L(...(current.title as [string, string]))}</h2>
            <ol>
              {current.steps.map((step) => (
                <li key={step[0]}>{L(step[0], step[1])}</li>
              ))}
            </ol>
            <Link href={current.link} className={styles.tryIt}>
              {L("ไปที่หน้านี้", "Try it now")} →
            </Link>
          </div>
        </section>

        <ul className={styles.list}>
          {DEFAULT_TUTORIALS.map((tutorial, index) => {
            const itemVideo = videoMap[tutorial.id]?.videoUrl || "";
            const itemDuration = videoMap[tutorial.id]?.duration || tutorial.duration;
            const hasVideo = !!embedUrl(itemVideo);
            return (
              <li key={tutorial.id}>
                <button
                  type="button"
                  className={index === active ? styles.itemActive : ""}
                  aria-current={index === active}
                  onClick={() => setActive(index)}
                >
                  <span className={styles.thumb} aria-hidden>
                    ▶
                  </span>
                  <span>
                    <b>{L(tutorial.title[0], tutorial.title[1])}</b>
                    <small>{hasVideo ? itemDuration : L("เร็ว ๆ นี้", "Coming soon")}</small>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
