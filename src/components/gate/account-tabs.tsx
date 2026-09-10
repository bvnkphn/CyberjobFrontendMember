"use client";

export type AccountType = "JOBSEEKER" | "EMPLOYER";

const TABS: { value: AccountType; label: string }[] = [
  { value: "JOBSEEKER", label: "ผู้หางาน" },
  { value: "EMPLOYER", label: "ผู้ประกอบการ" },
];

/** แท็บเลือกประเภทบัญชีเหนือการ์ด Login / สมัครสมาชิก */
export function AccountTabs({
  value,
  onChange,
}: {
  value: AccountType;
  onChange: (value: AccountType) => void;
}) {
  return (
    <div className="auth-tabs" role="tablist" aria-label="ประเภทบัญชี">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={value === tab.value}
          onClick={() => onChange(tab.value)}
          className={`auth-tab ${value === tab.value ? "active" : ""}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
