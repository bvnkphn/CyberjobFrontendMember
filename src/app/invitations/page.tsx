"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import "./invitations.css";

type Invitation = { id: number; initials: string; color: string; company: string; title: string; salary: string; detail: string; status: "pending" | "accepted" | "declined" };

const initialInvitations: Invitation[] = [
  { id: 1, initials: "AC", color: "blue", company: "บริษัท เอซีซี จำกัด", title: "ERP Developer (Microsoft Dynamics AX)", salary: "15,000 - 20,000 บาท", detail: "บริษัทสนใจประวัติของคุณและต้องการเชิญให้เข้าร่วมสมัครงานตำแหน่งนี้", status: "pending" },
  { id: 2, initials: "SS", color: "pink", company: "บริษัท เอสเอส จำกัด", title: "Cyber Security Analyst", salary: "30,000 - 50,000 บาท", detail: "ทีมงานเห็นว่าประสบการณ์ของคุณตรงกับตำแหน่งนี้ อยากเชิญคุณพูดคุยเพิ่มเติม", status: "pending" },
  { id: 3, initials: "CL", color: "green", company: "บริษัท คลีน จำกัด", title: "Frontend Developer (React)", salary: "30,000 - 55,000 บาท", detail: "ขอเชิญคุณเข้าร่วมพูดคุยเกี่ยวกับโอกาสการทำงานกับบริษัท", status: "accepted" },
  { id: 4, initials: "NS", color: "gray", company: "บริษัท เอ็นเอส จำกัด", title: "ERP Developer (Microsoft Dynamics AX)", salary: "15,000 - 20,000 บาท", detail: "บริษัทสนใจประวัติของคุณและต้องการเชิญให้เข้าร่วมสมัครงานตำแหน่งนี้", status: "declined" },
];

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState(initialInvitations);
  const [filter, setFilter] = useState<"all" | "pending">("all");
  const visibleInvitations = filter === "pending" ? invitations.filter((invitation) => invitation.status === "pending") : invitations;
  const updateStatus = (id: number, status: "accepted" | "declined") => setInvitations((items) => items.map((item) => item.id === id ? { ...item, status } : item));

  return <div className="invitations-shell"><Header /><main className="invitations-page">
    <header className="invitations-heading"><h1>คำเชิญจากบริษัท <span>({invitations.length + 1})</span></h1><div className="invitation-tabs"><button className={filter === "all" ? "active" : ""} type="button" onClick={() => setFilter("all")}>ทั้งหมด</button><button className={filter === "pending" ? "active" : ""} type="button" onClick={() => setFilter("pending")}>รอตอบกลับ</button></div></header>
    <section className="invitation-grid" aria-label="รายการคำเชิญ">{visibleInvitations.map((invitation) => <article className="invitation-card" key={invitation.id}><div className="invitation-company"><span className={`company-initial ${invitation.color}`}>{invitation.initials}</span><div><small>{invitation.company}</small><h2>{invitation.title}</h2><p>{invitation.company} เงินเดือน {invitation.salary}</p></div></div><p className="invitation-detail">{invitation.detail}</p><strong className="invitation-salary">{invitation.salary}</strong><div className="invitation-actions">{invitation.status === "pending" ? <><button className="accept-button" type="button" onClick={() => updateStatus(invitation.id, "accepted")}>✓ ตอบรับ</button><button className="decline-button" type="button" onClick={() => updateStatus(invitation.id, "declined")}>× ปฏิเสธ</button></> : <span className={`status-pill ${invitation.status}`}>{invitation.status === "accepted" ? "✓ ตอบรับแล้ว" : "× ปฏิเสธแล้ว"}</span>}</div></article>)}</section>
    {visibleInvitations.length === 0 && <p className="empty-invitations">ไม่มีคำเชิญที่รอตอบกลับ</p>}
  </main><Footer /></div>;
}
