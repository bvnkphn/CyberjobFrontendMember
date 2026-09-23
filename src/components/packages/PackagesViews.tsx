"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ErrorState, Loading, Notice } from "@/components/ui/ui";
import { fileSize, formatBaht, formatDate } from "@/lib/format";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { errorMessage, useApi, useOwner } from "@/lib/owner";
import type { Packages, Payment, PlanName } from "@/lib/types";
import styles from "./Packages.module.css";

const PLAN_CLASS: Record<PlanName, string> = { FREE: "", GOLD: styles.gold, PLATINUM: styles.platinum };

const STATUS_LABEL = {
  pending: { th: "รอตรวจสอบ", en: "Pending review" },
  approved: { th: "อนุมัติแล้ว", en: "Approved" },
  rejected: { th: "ไม่ผ่านการตรวจสอบ", en: "Rejected" },
} as const;

/** หน้าแพ็กเกจ (Owner Feature 9) */
export function PackagesView() {
  const { isEn } = useLanguage();
  const L = (th: string, en: string) => (isEn ? en : th);
  const data = useApi<Packages>("/owner/packages");

  if (data.loading && !data.data) return <Loading />;
  if (data.error || !data.data) return <ErrorState message={data.error?.message ?? ""} onRetry={data.reload} />;

  const { plans, current, pendingPayment, payments } = data.data;

  return (
    <main className={styles.main}>
      <header className={styles.heading}>
        <h1>{L("แพ็กเกจสำหรับบริษัท", "Packages for companies")}</h1>
        <p>{L("สำหรับบริษัทที่ต้องการเพิ่มจำนวนโพสต์งานและเข้าถึงผู้สมัครได้มากขึ้น", "Post more jobs and reach more candidates")}</p>
      </header>

      <p className={styles.current}>
        {L("แพ็กเกจปัจจุบัน", "Current plan")} <b>{current.plan}</b>
        {current.expiresAt && <span>{L(`ใช้ได้ถึง ${formatDate(current.expiresAt)}`, `valid until ${formatDate(current.expiresAt)}`)}</span>}
      </p>

      {pendingPayment && (
        <Notice tone="warning">
          {L(
            `ส่งหลักฐานการชำระเงินแพ็กเกจ ${pendingPayment.planName} แล้ว อยู่ระหว่างรอตรวจสอบ`,
            `Your ${pendingPayment.planName} payment is waiting for review`,
          )}
        </Notice>
      )}

      <div className={styles.plans}>
        {plans.map((plan) => {
          const isCurrent = plan.plan === current.plan;
          return (
            <article className={`${styles.plan} ${PLAN_CLASS[plan.plan]}`} key={plan.plan}>
              {plan.recommended && <span className={styles.recommended}>{L("แนะนำ", "Recommended")}</span>}
              {isCurrent && <span className={styles.currentBadge}>{L("ใช้อยู่", "Current")}</span>}
              <h2>{plan.name}</h2>
              <strong>{plan.price === 0 ? L("0 บาท", "Free") : formatBaht(plan.price, isEn)}</strong>
              <p>{plan.price === 0 ? L("สมัครสมาชิกฟรี", "Free membership") : L("ต่อเดือน", "per month")}</p>
              <hr />
              <ul className={styles.features}>
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              {plan.price === 0 ? (
                <Link href="/dashboard" className={styles.action}>
                  {isCurrent ? L("ใช้งานแพ็กเกจนี้อยู่", "You are on this plan") : L("เริ่มใช้งานฟรี", "Start for free")}
                </Link>
              ) : (
                <Link
                  href={`/packages/payment?plan=${plan.plan}`}
                  className={styles.action}
                  aria-disabled={Boolean(pendingPayment)}
                >
                  {isCurrent ? L(`ต่ออายุ ${plan.name}`, `Renew ${plan.name}`) : L(`เลือกแพ็กเกจ ${plan.name}`, `Choose ${plan.name}`)}
                </Link>
              )}
            </article>
          );
        })}
      </div>

      {payments.length > 0 && (
        <section className={`${styles.card} ${styles.history}`}>
          <h2>{L("ประวัติการชำระเงิน", "Payment history")}</h2>
          <table>
            <thead>
              <tr>
                <th>{L("วันที่", "Date")}</th>
                <th>{L("แพ็กเกจ", "Plan")}</th>
                <th>{L("ยอดชำระ", "Amount")}</th>
                <th>{L("สถานะ", "Status")}</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{formatDate(payment.createdAt)}</td>
                  <td>{payment.planName}</td>
                  <td>{formatBaht(payment.amount, isEn)}</td>
                  <td>{isEn ? STATUS_LABEL[payment.status].en : STATUS_LABEL[payment.status].th}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </main>
  );
}

/** หน้าชำระเงิน – แนบหลักฐานการโอน */
export function PaymentView() {
  const { isEn } = useLanguage();
  const L = (th: string, en: string) => (isEn ? en : th);
  const router = useRouter();
  const params = useSearchParams();
  const { api, reloadMe } = useOwner();
  const data = useApi<Packages>("/owner/packages");
  const planName: PlanName = params.get("plan") === "PLATINUM" ? "PLATINUM" : "GOLD";
  const [method, setMethod] = useState<"promptpay" | "bank_transfer">("promptpay");
  const [proof, setProof] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (data.loading && !data.data) return <Loading />;
  if (data.error || !data.data) return <ErrorState message={data.error?.message ?? ""} onRetry={data.reload} />;

  const plan = data.data.plans.find((item) => item.plan === planName)!;
  const info = data.data.paymentInfo;
  const price = formatBaht(plan.price, isEn);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!proof) {
      setError(L("กรุณาแนบหลักฐานการชำระเงิน", "Please attach your payment proof"));
      return;
    }
    const body = new FormData();
    body.append("plan", planName);
    body.append("method", method);
    body.append("proof", proof);
    setSaving(true);
    setError(null);
    try {
      const payment = await api<Payment>("/owner/payments", { body });
      await reloadMe();
      router.push(`/packages/success?id=${payment.id}`);
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className={`${styles.main} ${styles.narrow}`} onSubmit={submit}>
      <header className={styles.heading}>
        <h1>{L("ชำระเงิน", "Payment")}</h1>
        <p>{L("ตรวจสอบแพ็กเกจและแนบหลักฐานการชำระเงิน", "Review your package and attach proof of payment")}</p>
      </header>

      {data.data.pendingPayment && (
        <Notice tone="warning">{L("มีรายการที่รอตรวจสอบอยู่แล้ว ส่งใหม่ได้หลังรายการเดิมตรวจสอบเสร็จ", "You already have a payment waiting for review")}</Notice>
      )}
      {error && <Notice tone="error">{error}</Notice>}

      <section className={`${styles.card} ${styles.selected}`}>
        <div>
          <h2>{L("แพ็กเกจที่เลือก", "Selected package")}</h2>
          <strong>{plan.name}</strong>
          <p>{L("รอบการเรียกเก็บเงิน: รายเดือน", "Billing cycle: monthly")}</p>
          <b>{price}</b>
          <ul className={styles.features}>
            {plan.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </div>
        <Link href="/packages">{L("เปลี่ยนแพ็กเกจ", "Change package")}</Link>
      </section>

      <section className={styles.card}>
        <h2>{L("สรุปค่าใช้บริการ", "Summary")}</h2>
        <div className={styles.row}>
          <span>{L("ค่าแพ็กเกจ", "Package price")}</span>
          <b>{price}</b>
        </div>
        <div className={styles.row}>
          <span>{L("รอบการชำระเงิน", "Billing cycle")}</span>
          <b>{L("รายเดือน", "Monthly")}</b>
        </div>
        <div className={styles.total}>
          <strong>{L("ยอดรวมที่ต้องชำระ", "Total")}</strong>
          <b>{price}</b>
        </div>
      </section>

      <section className={styles.card}>
        <h2>{L("วิธีการชำระเงิน", "Payment method")}</h2>
        <div className={styles.methods}>
          <button type="button" className={method === "promptpay" ? styles.methodActive : ""} aria-pressed={method === "promptpay"} onClick={() => setMethod("promptpay")}>
            ▦ &nbsp; QR Code / PromptPay
          </button>
          <button type="button" className={method === "bank_transfer" ? styles.methodActive : ""} aria-pressed={method === "bank_transfer"} onClick={() => setMethod("bank_transfer")}>
            ♜ &nbsp; {L("โอนผ่านธนาคาร", "Bank transfer")}
          </button>
        </div>
        {method === "promptpay" ? (
          <div className={styles.qr}>
            <div className={styles.qrBox}>
              PromptPay
              <br />
              {info.promptPayId}
            </div>
            <p>{L("สแกน QR Code หรือโอนผ่าน PromptPay เพื่อชำระเงิน", "Scan the QR code or pay via PromptPay")}</p>
            <strong>{price}</strong>
          </div>
        ) : (
          <div className={styles.bank}>
            <div>
              <span>{L("ธนาคาร", "Bank")}</span>
              <b>{info.bankName}</b>
              <span>{L("เลขบัญชี", "Account no.")}</span>
              <b>{info.accountNo}</b>
            </div>
            <div>
              <span>{L("ชื่อบัญชี", "Account name")}</span>
              <b>{info.accountName}</b>
              <span>{L("จำนวนเงินที่ต้องชำระ", "Amount")}</span>
              <b>{price}</b>
            </div>
          </div>
        )}
      </section>

      <section className={styles.card}>
        <h2>{L("อัปโหลดหลักฐานการชำระเงิน", "Upload proof of payment")}</h2>
        <p className={styles.hint}>{L("รองรับไฟล์ JPG, PNG และ PDF ขนาดไม่เกิน 10 MB", "JPG, PNG or PDF up to 10 MB")}</p>
        <label className={styles.upload}>
          <input hidden type="file" accept="image/png,image/jpeg,application/pdf" onChange={(event) => setProof(event.target.files?.[0] ?? null)} />↑
          <span>{proof ? `${proof.name} (${fileSize(proof.size)})` : L("คลิกเพื่อเลือกไฟล์หลักฐานการชำระเงิน", "Click to choose a file")}</span>
        </label>
      </section>

      <button type="submit" className={styles.confirm} disabled={saving || Boolean(data.data.pendingPayment)}>
        {saving ? L("กำลังส่งข้อมูล...", "Submitting...") : L("ยืนยันการชำระเงิน", "Confirm payment")}
      </button>
    </form>
  );
}

/** ส่งข้อมูลการชำระเงินเรียบร้อยแล้ว */
export function PaymentSuccessView() {
  const { isEn } = useLanguage();
  const L = (th: string, en: string) => (isEn ? en : th);
  const params = useSearchParams();
  const id = params.get("id");
  const payment = useApi<Payment>(id ? `/owner/payments/${id}` : null);

  if (!id) return <ErrorState message={L("ไม่พบรายการชำระเงิน", "Payment not found")} />;
  if (payment.loading && !payment.data) return <Loading />;
  if (payment.error || !payment.data) return <ErrorState message={payment.error?.message ?? ""} onRetry={payment.reload} />;

  const item = payment.data;
  const approved = item.status === "approved";

  return (
    <main className={styles.success}>
      <div className={styles.successIcon}>✓</div>
      <h1>{L("ส่งข้อมูลการชำระเงินเรียบร้อยแล้ว", "Payment submitted")}</h1>
      <p>
        {approved
          ? L("ระบบอนุมัติแพ็กเกจของคุณแล้ว เริ่มใช้งานได้ทันที", "Your package is active now")
          : L("ระบบได้รับหลักฐานการชำระเงินของคุณแล้ว กรุณารอการตรวจสอบ", "We received your proof of payment. Please wait for review.")}
      </p>
      <section className={styles.summary}>
        <div>
          <span>{L("แพ็กเกจ", "Package")}</span>
          <b>{item.planName}</b>
        </div>
        <div>
          <span>{L("ยอดชำระ", "Amount")}</span>
          <b>{formatBaht(item.amount, isEn)}</b>
        </div>
        <div>
          <span>{L("วันที่ส่งหลักฐาน", "Submitted")}</span>
          <b>{formatDate(item.createdAt)}</b>
        </div>
        <div>
          <span>{L("สถานะ", "Status")}</span>
          <em className={`${styles.pill} ${approved ? styles.pillApproved : ""}`}>
            {isEn ? STATUS_LABEL[item.status].en : STATUS_LABEL[item.status].th}
          </em>
        </div>
      </section>
      <div className={styles.successActions}>
        <Link href="/packages">{L("กลับไปหน้าแพ็กเกจ", "Back to packages")}</Link>
        <Link href="/dashboard" className={styles.primaryLink}>
          {L("กลับไป Dashboard", "Go to dashboard")}
        </Link>
      </div>
    </main>
  );
}
