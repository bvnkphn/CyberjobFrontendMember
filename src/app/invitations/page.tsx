"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { MemberInvitation } from "@cyberjob/shared";
import { PageHeading } from "@/components/page-heading";
import { useAuth } from "@/public-site/auth/AuthProvider";
import { ApiError } from "@/public-site/lib/api";
import { formatSalary } from "@/public-site/lib/format";
import { meService } from "@/public-site/services/auth.service";
import "./invitations.css";

const COLORS = ["blue", "pink", "green", "gray"];

/** คำเชิญจากบริษัท – บริษัทส่งมาจากหลังบ้านผู้ประกอบการ (Owner Feature 2.5) */
export default function InvitationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [invitations, setInvitations] = useState<MemberInvitation[] | null>(null);
  const [filter, setFilter] = useState<"all" | "pending">("all");
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;
    meService
      .invitations()
      .then(setInvitations)
      .catch((reason) => setError(reason instanceof ApiError ? reason.message : "ไม่สามารถโหลดคำเชิญได้"));
  }, [authLoading, user]);

  const respond = async (id: string, status: "accepted" | "declined") => {
    setBusyId(id);
    setError(null);
    try {
      const updated = await meService.respondInvitation(id, status);
      setInvitations((items) => items?.map((item) => (item.id === id ? updated : item)) ?? null);
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "ไม่สามารถตอบคำเชิญได้");
    } finally {
      setBusyId(null);
    }
  };

  const list = invitations ?? [];
  const visible = filter === "pending" ? list.filter((item) => item.status === "sent") : list;

  return (
    <div className="invitations-shell">
      <main className="invitations-page member-page-container">
        <div className="invitations-heading">
          <PageHeading
            title={`คำเชิญจากบริษัท (${list.length})`}
            description="ตรวจสอบและตอบรับคำเชิญจากบริษัทที่สนใจโปรไฟล์ของคุณ"
            fallbackHref="/profile"
          />
          <div className="invitation-tabs">
            <button className={filter === "all" ? "active" : ""} type="button" onClick={() => setFilter("all")}>
              ทั้งหมด
            </button>
            <button className={filter === "pending" ? "active" : ""} type="button" onClick={() => setFilter("pending")}>
              รอตอบกลับ
            </button>
          </div>
        </div>

        {!authLoading && !user ? (
          <p className="empty-invitations">
            <Link href="/gate/login?next=/invitations">เข้าสู่ระบบ</Link> เพื่อดูคำเชิญจากบริษัท
          </p>
        ) : invitations === null && !error ? (
          <p className="empty-invitations">กำลังโหลดคำเชิญ...</p>
        ) : (
          <>
            {error && <p className="empty-invitations">{error}</p>}
            <section className="invitation-grid" aria-label="รายการคำเชิญ">
              {visible.map((invitation, index) => {
                const { job } = invitation;
                const salary = formatSalary(job, "ตามตกลง");
                return (
                  <article className="invitation-card" key={invitation.id}>
                    <div className="invitation-company">
                      <span className={`company-initial ${COLORS[index % COLORS.length]}`}>{job.company.logoText}</span>
                      <div>
                        <small>{job.company.name}</small>
                        <h2>
                          <Link href={`/jobs/${job.id}`}>{job.title}</Link>
                        </h2>
                        <p>
                          {job.company.name} เงินเดือน {salary}
                        </p>
                      </div>
                    </div>
                    <p className="invitation-detail">
                      {invitation.message ?? "บริษัทสนใจประวัติของคุณและต้องการเชิญให้เข้าร่วมสมัครงานตำแหน่งนี้"}
                    </p>
                    <strong className="invitation-salary">{salary}</strong>
                    <div className="invitation-actions">
                      {invitation.status === "sent" ? (
                        <>
                          <button
                            className="accept-button"
                            type="button"
                            disabled={busyId === invitation.id}
                            onClick={() => respond(invitation.id, "accepted")}
                          >
                            ✓ ตอบรับ
                          </button>
                          <button
                            className="decline-button"
                            type="button"
                            disabled={busyId === invitation.id}
                            onClick={() => respond(invitation.id, "declined")}
                          >
                            × ปฏิเสธ
                          </button>
                        </>
                      ) : (
                        <span className={`status-pill ${invitation.status}`}>
                          {invitation.status === "accepted" ? "✓ ตอบรับแล้ว" : "× ปฏิเสธแล้ว"}
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </section>
            {invitations !== null && visible.length === 0 && (
              <p className="empty-invitations">{filter === "pending" ? "ไม่มีคำเชิญที่รอตอบกลับ" : "ยังไม่มีคำเชิญจากบริษัท"}</p>
            )}
          </>
        )}
      </main>
    </div>
  );
}
