import React, { useState } from "react";

import {
  GraduationCap,
  Users,
  User,
  Phone,
  CreditCard,
  CheckCircle2,
  Search,
  ArrowLeft,
  ArrowRight,
  MapPin,
  Mail,
  Clock,
  Loader2,
  AlertCircle,
  Send,
  Landmark,
  BadgeCheck,
  Calendar,
  School,
  XCircle,
} from "lucide-react";

/* ------------------------------------------------------------------
   CONFIG  
------------------------------------------------------------------- */
const APPS_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SHEETS_URL;

const SCHOOL = {
  name: "Mohammadpur Preparatory School & College",
  nameBn: "মোহাম্মদপুর প্রিপারেটরি স্কুল এন্ড কলেজ",
  since: 1976,
  eiin: "132107",
  addresses: [
    {
      label: "Girls' Wing & Head Office",
      address: "15/1, Iqbal Road",
      phone: "02-41022959",
    },
    { label: "Boys' Wing", address: "3/3, Asad Avenue", phone: "02-48121417" },
    { label: "Pre School", address: "73/C, Asad Avenue", phone: "029102931" },
  ],
  contacts: [
    { label: "Girls", phone: "01308630897" },
    { label: "Boys", phone: "01533291012" },
    { label: "Pre", phone: "01533254152" },
  ],
  email: "mphss08@yahoo.com",
};

const MEMBER_TYPES = [
  {
    id: "present",
    label: "Present Student",
    description: "Currently studying at MPSC",
    icon: School,
  },
  {
    id: "alumni",
    label: "Alumni",
    description: "Completed studies at MPSC",
    icon: GraduationCap,
  },
];

const CATEGORIES = {
  present: [
    { id: "hsc", label: "HSC Level", fee: 1500 },
    { id: "below", label: "Below HSC Level", fee: 1500 },
    { id: "above", label: "Above HSC Level", fee: 2000 },
  ],
  alumni: [
    { id: "before2016", label: "Before 2016", fee: 4000 },
    { id: "after2016", label: "After 2016", fee: 2500 },
  ],
};

const COLORS = {
  bg: "#F6F4EE",
  panel: "#FFFFFF",
  ink: "#1C2B22",
  inkSoft: "#3E493F",
  primary: "#1B4332",
  primaryDark: "#0F2A1C",
  gold: "#B8892B",
  goldSoft: "#F1E6CC",
  line: "#E4E0D4",
  muted: "#767F72",
  danger: "#B3402A",
  dangerSoft: "#F7E7E2",
  success: "#2F6B3A",
  successSoft: "#E6EFE4",
};

const FONTS = {
  serif: "'Source Serif 4', Georgia, 'Times New Roman', serif",
  sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const STEPS = ["Type", "Category", "Details", "Payment"];

function formatTaka(n) {
  return `৳${n.toLocaleString("en-US")}`;
}

function isValidBDPhone(v) {
  return /^01[0-9]{9}$/.test(v.trim());
}

export default function AlumniRegistration() {
  // All built-in env vars
  // console.log(import.meta.env.VITE_GOOGLE_SHEETS_URL);
  const [screen, setScreen] = useState("welcome");
  // welcome | memberType | category | form | submitting | success | statusCheck | statusResult

  const [memberType, setMemberType] = useState(null);
  const [category, setCategory] = useState(null);

  const [form, setForm] = useState({
    name: "",
    session: "",
    contact: "",
    paymentMethod: "bkash",
    transactionId: "",
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [regId, setRegId] = useState("");

  const [statusPhone, setStatusPhone] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState("");
  const [statusResults, setStatusResults] = useState([]);

  const currentCategory =
    memberType && category
      ? CATEGORIES[memberType].find((c) => c.id === category)
      : null;

  function resetFlow() {
    setMemberType(null);
    setCategory(null);
    setForm({
      name: "",
      session: "",
      contact: "",
      paymentMethod: "bkash",
      transactionId: "",
    });
    setErrors({});
    setSubmitError("");
    setRegId("");
    setScreen("welcome");
  }

  function handleField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: null }));
  }

  function validateForm() {
    const e = {};
    if (!form.name.trim()) e.name = "Enter the full name.";
    if (!form.session.trim())
      e.session = "Enter the session or batch, e.g. HSC 2022.";
    if (!isValidBDPhone(form.contact))
      e.contact = "Enter an 11-digit number starting with 01.";
    if (!form.transactionId.trim())
      e.transactionId = "Enter the payment transaction ID.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    setSubmitError("");
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        memberType: memberType === "present" ? "Present Student" : "Alumni",
        category: currentCategory.label,
        session: form.session.trim(),
        contact: form.contact.trim(),
        paymentMethod: form.paymentMethod === "bkash" ? "bKash" : "Nagad",
        transactionId: form.transactionId.trim(),
        fee: currentCategory.fee,
      };

      const res = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        setRegId(data.regId || "");
        setScreen("success");
      } else {
        setSubmitError(
          data.message || "Something went wrong. Please try again.",
        );
      }
    } catch (err) {
      setSubmitError(
        "Could not reach the server. Check your connection and try again.",
      );
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusCheck(ev) {
    ev.preventDefault();
    setStatusError("");
    setStatusResults([]);
    if (!isValidBDPhone(statusPhone)) {
      setStatusError("Enter a valid 11-digit phone number.");
      return;
    }
    setStatusLoading(true);
    try {
      const url = `${APPS_SCRIPT_URL}?action=status&phone=${encodeURIComponent(statusPhone.trim())}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        if (data.results.length === 0) {
          setStatusError("No registration found for this number.");
        } else {
          setStatusResults(data.results);
          setScreen("statusResult");
        }
      } else {
        setStatusError(data.message || "Could not look up this number.");
      }
    } catch (err) {
      setStatusError(
        "Could not reach the server. Check your connection and try again.",
      );
    } finally {
      setStatusLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: COLORS.bg,
        fontFamily: FONTS.sans,
        color: COLORS.ink,
        display: "flex",
        justifyContent: "center",
        padding: "32px 16px",
        boxSizing: "border-box",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        input, button, select { font-family: inherit; }
        input:focus, button:focus, .selectable:focus {
          outline: 2px solid ${COLORS.gold};
          outline-offset: 2px;
        }
        button { cursor: pointer; }
        @media (prefers-reduced-motion: reduce) {
          * { transition: none !important; animation: none !important; }
        }
      `}</style>

      <div style={{ width: "100%", maxWidth: 480 }}>
        <Header />

        <div
          style={{
            background: COLORS.panel,
            border: `1px solid ${COLORS.line}`,
            borderRadius: 4,
            marginTop: 20,
            overflow: "hidden",
          }}
        >
          {["memberType", "category", "form"].includes(screen) && (
            <StepBar
              current={
                screen === "memberType" ? 0 : screen === "category" ? 1 : 2
              }
            />
          )}

          <div style={{ padding: "28px 24px" }}>
            {screen === "welcome" && (
              <Welcome
                onStart={() => setScreen("memberType")}
                onCheckStatus={() => setScreen("statusCheck")}
              />
            )}

            {screen === "memberType" && (
              <MemberTypeStep
                onBack={() => setScreen("welcome")}
                onSelect={(id) => {
                  setMemberType(id);
                  setCategory(null);
                  setScreen("category");
                }}
              />
            )}

            {screen === "category" && (
              <CategoryStep
                memberType={memberType}
                onBack={() => setScreen("memberType")}
                onSelect={(id) => {
                  setCategory(id);
                  setScreen("form");
                }}
              />
            )}

            {screen === "form" && (
              <FormStep
                memberType={memberType}
                category={currentCategory}
                form={form}
                errors={errors}
                submitError={submitError}
                submitting={submitting}
                onChange={handleField}
                onBack={() => setScreen("category")}
                onSubmit={handleSubmit}
              />
            )}

            {screen === "success" && (
              <SuccessStep
                regId={regId}
                fee={currentCategory?.fee}
                onDone={resetFlow}
              />
            )}

            {screen === "statusCheck" && (
              <StatusCheckStep
                phone={statusPhone}
                setPhone={setStatusPhone}
                loading={statusLoading}
                error={statusError}
                onBack={() => setScreen("welcome")}
                onSubmit={handleStatusCheck}
              />
            )}

            {screen === "statusResult" && (
              <StatusResultStep
                results={statusResults}
                onBack={() => setScreen("statusCheck")}
                onHome={resetFlow}
              />
            )}
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}

/* ------------------------------ Header / Footer ------------------------------ */

function Header() {
  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: "primary",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 14px",
        }}
      >
        {/* <Landmark size={26} color={COLORS.goldSoft} strokeWidth={1.75} /> */}

        <img src="logo.png" alt="" />
      </div>
      <h1
        style={{
          fontFamily: FONTS.serif,
          fontSize: 22,
          fontWeight: 600,
          margin: 0,
          lineHeight: 1.25,
          color: COLORS.primaryDark,
        }}
      >
        {SCHOOL.name}
      </h1>
      <p style={{ margin: "4px 0 0", fontSize: 15, color: COLORS.inkSoft }}>
        {SCHOOL.nameBn}
      </p>
      <p
        style={{
          margin: "8px 0 0",
          fontSize: 12.5,
          color: COLORS.muted,
          letterSpacing: 0.2,
        }}
      >
        Since {SCHOOL.since} &nbsp;·&nbsp; EIIN {SCHOOL.eiin}
      </p>
    </div>
  );
}

function Footer() {
  return (
    <div style={{ marginTop: 24, padding: "0 4px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          fontSize: 12.5,
          color: COLORS.muted,
          marginBottom: 14,
        }}
      >
        <Calendar size={14} />
        <span>Alumni Association Event Date: To Be Announced</span>
      </div>

      <div
        style={{
          display: "grid",
          gap: 10,
          fontSize: 12.5,
          color: COLORS.muted,
        }}
      >
        {SCHOOL.addresses.map((a) => (
          <div
            key={a.label}
            style={{ display: "flex", gap: 8, alignItems: "flex-start" }}
          >
            <MapPin size={14} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>
              <strong style={{ color: COLORS.inkSoft }}>{a.label}:</strong>{" "}
              {a.address} &nbsp;|&nbsp; T: {a.phone}
            </span>
          </div>
        ))}
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          <Phone size={14} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>
            {SCHOOL.contacts.map((c) => `${c.label}: ${c.phone}`).join("  ·  ")}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          <Mail size={14} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{SCHOOL.email}</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Step bar ------------------------------ */

function StepBar({ current }) {
  return (
    <div
      style={{
        display: "flex",
        borderBottom: `1px solid ${COLORS.line}`,
        background: COLORS.bg,
      }}
    >
      {STEPS.slice(0, 3).map((label, i) => {
        const active = i === current;
        const done = i < current;
        return (
          <div
            key={label}
            style={{
              flex: 1,
              padding: "12px 8px",
              textAlign: "center",
              fontSize: 12,
              fontWeight: active ? 600 : 500,
              color: active ? COLORS.primary : done ? COLORS.muted : "#B7BBAF",
              borderBottom: `2px solid ${active ? COLORS.gold : "transparent"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            {done ? <CheckCircle2 size={13} /> : <span>{i + 1}</span>}
            {label}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------ Welcome ------------------------------ */

function Welcome({ onStart, onCheckStatus }) {
  return (
    <div>
      <h2
        style={{
          fontFamily: FONTS.serif,
          fontSize: 19,
          margin: "0 0 8px",
          color: COLORS.ink,
        }}
      >
        Alumni Association Registration
      </h2>
      <p
        style={{
          fontSize: 14.5,
          color: COLORS.inkSoft,
          lineHeight: 1.6,
          margin: "0 0 24px",
        }}
      >
        Register as a present student or an alumnus of MPSC. Registration takes
        about two minutes — have your bKash or Nagad transaction ID ready before
        you start.
      </p>

      <button
        onClick={onStart}
        style={{
          width: "100%",
          background: COLORS.primary,
          color: "#fff",
          border: "none",
          borderRadius: 4,
          padding: "13px 16px",
          fontSize: 15,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        Start Registration
        <ArrowRight size={17} />
      </button>

      <button
        onClick={onCheckStatus}
        style={{
          width: "100%",
          background: "transparent",
          color: COLORS.primary,
          border: `1px solid ${COLORS.line}`,
          borderRadius: 4,
          padding: "13px 16px",
          fontSize: 15,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          marginTop: 10,
        }}
      >
        <Search size={16} />
        Check Registration Status
      </button>
    </div>
  );
}

/* ------------------------------ Member type ------------------------------ */

function MemberTypeStep({ onSelect, onBack }) {
  return (
    <div>
      <BackLink onClick={onBack} />
      <h2
        style={{ fontFamily: FONTS.serif, fontSize: 18, margin: "12px 0 16px" }}
      >
        Who is registering?
      </h2>
      <div style={{ display: "grid", gap: 10 }}>
        {MEMBER_TYPES.map((t) => (
          <SelectCard
            key={t.id}
            icon={t.icon}
            title={t.label}
            subtitle={t.description}
            onClick={() => onSelect(t.id)}
          />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ Category ------------------------------ */

function CategoryStep({ memberType, onSelect, onBack }) {
  const options = CATEGORIES[memberType] || [];
  const heading =
    memberType === "present"
      ? "Select your education level"
      : "Select your graduation period";

  return (
    <div>
      <BackLink onClick={onBack} />
      <h2
        style={{ fontFamily: FONTS.serif, fontSize: 18, margin: "12px 0 16px" }}
      >
        {heading}
      </h2>
      <div style={{ display: "grid", gap: 10 }}>
        {options.map((c) => (
          <SelectCard
            key={c.id}
            icon={BadgeCheck}
            title={c.label}
            subtitle={`Registration fee: ${formatTaka(c.fee)}`}
            onClick={() => onSelect(c.id)}
          />
        ))}
      </div>
    </div>
  );
}

function SelectCard({ icon: Icon, title, subtitle, onClick }) {
  return (
    <button
      onClick={onClick}
      className="selectable"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        width: "100%",
        textAlign: "left",
        background: COLORS.bg,
        border: `1px solid ${COLORS.line}`,
        borderRadius: 4,
        padding: "14px 16px",
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 4,
          background: COLORS.goldSoft,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={18} color={COLORS.primaryDark} strokeWidth={1.75} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14.5, fontWeight: 600, color: COLORS.ink }}>
          {title}
        </div>
        <div style={{ fontSize: 12.5, color: COLORS.muted, marginTop: 1 }}>
          {subtitle}
        </div>
      </div>
      <ArrowRight size={16} color={COLORS.muted} />
    </button>
  );
}

/* ------------------------------ Form ------------------------------ */

function FormStep({
  memberType,
  category,
  form,
  errors,
  submitError,
  submitting,
  onChange,
  onBack,
  onSubmit,
}) {
  return (
    <div>
      <BackLink onClick={onBack} />
      <h2
        style={{ fontFamily: FONTS.serif, fontSize: 18, margin: "12px 0 4px" }}
      >
        Registration Details
      </h2>
      <p style={{ fontSize: 13, color: COLORS.muted, margin: "0 0 18px" }}>
        {memberType === "present" ? "Present Student" : "Alumni"} ·{" "}
        {category?.label}
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: COLORS.goldSoft,
          borderRadius: 4,
          padding: "10px 14px",
          marginBottom: 20,
        }}
      >
        <span
          style={{ fontSize: 13, fontWeight: 500, color: COLORS.primaryDark }}
        >
          Registration Fee
        </span>
        <span
          style={{ fontSize: 16, fontWeight: 700, color: COLORS.primaryDark }}
        >
          {formatTaka(category?.fee || 0)}
        </span>
      </div>

      <form onSubmit={onSubmit}>
        <Field label="Full Name" error={errors.name}>
          <TextInput
            icon={User}
            placeholder="e.g. Tabassum *****"
            value={form.name}
            onChange={(v) => onChange("name", v)}
          />
        </Field>

        <Field
          label="Session / Batch"
          error={errors.session}
          hint="e.g. HSC 2022, SSC 2020"
        >
          <TextInput
            icon={GraduationCap}
            placeholder="e.g. HSC 2022"
            value={form.session}
            onChange={(v) => onChange("session", v)}
          />
        </Field>

        <Field
          label="Contact Number"
          error={errors.contact}
          hint="11 digits, starting with 01"
        >
          <TextInput
            icon={Phone}
            placeholder="e.g. 01712345678"
            value={form.contact}
            onChange={(v) =>
              onChange("contact", v.replace(/[^0-9]/g, "").slice(0, 11))
            }
            inputMode="numeric"
          />
        </Field>

        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: COLORS.inkSoft,
              display: "block",
              marginBottom: 8,
            }}
          >
            Payment Method
          </label>
          <div style={{ display: "flex", gap: 10 }}>
            <PaymentToggle
              label="bKash"
              active={form.paymentMethod === "bkash"}
              onClick={() => onChange("paymentMethod", "bkash")}
            />
            <PaymentToggle
              label="Nagad"
              active={form.paymentMethod === "nagad"}
              onClick={() => onChange("paymentMethod", "nagad")}
            />
          </div>
          <p
            style={{
              fontSize: 12,
              color: COLORS.muted,
              margin: "8px 0 0",
              lineHeight: 1.5,
            }}
          >
            Send {formatTaka(category?.fee || 0)} to the association{" "}
            {form.paymentMethod === "bkash" ? "bKash" : "Nagad"} merchant
            number, then enter the transaction ID below.
          </p>
        </div>

        <Field
          label="Transaction ID"
          error={errors.transactionId}
          hint="From your payment confirmation SMS"
        >
          <TextInput
            icon={CreditCard}
            placeholder="e.g. 8N7A2K9X1P"
            value={form.transactionId}
            onChange={(v) => onChange("transactionId", v.toUpperCase())}
          />
        </Field>

        {submitError && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              background: COLORS.dangerSoft,
              color: COLORS.danger,
              borderRadius: 4,
              padding: "10px 12px",
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{submitError}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: "100%",
            background: COLORS.primary,
            color: "#fff",
            border: "none",
            borderRadius: 4,
            padding: "13px 16px",
            fontSize: 15,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            opacity: submitting ? 0.75 : 1,
          }}
        >
          {submitting ? (
            <>
              <Loader2
                size={17}
                className="spin"
                style={{ animation: "spin 0.8s linear infinite" }}
              />
              Submitting
            </>
          ) : (
            <>
              <Send size={16} />
              Submit Registration
            </>
          )}
        </button>
      </form>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Field({ label, error, hint, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: COLORS.inkSoft,
          display: "block",
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      {children}
      {error ? (
        <p style={{ fontSize: 12, color: COLORS.danger, margin: "6px 0 0" }}>
          {error}
        </p>
      ) : hint ? (
        <p style={{ fontSize: 12, color: COLORS.muted, margin: "6px 0 0" }}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function TextInput({ icon: Icon, value, onChange, placeholder, inputMode }) {
  return (
    <div style={{ position: "relative" }}>
      <Icon
        size={16}
        color={COLORS.muted}
        style={{
          position: "absolute",
          left: 12,
          top: "50%",
          transform: "translateY(-50%)",
        }}
      />
      <input
        type="text"
        inputMode={inputMode}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "11px 12px 11px 36px",
          border: `1px solid ${COLORS.line}`,
          borderRadius: 4,
          fontSize: 14,
          color: COLORS.ink,
          background: COLORS.panel,
        }}
      />
    </div>
  );
}

function PaymentToggle({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        padding: "10px 12px",
        borderRadius: 4,
        border: `1px solid ${active ? COLORS.primary : COLORS.line}`,
        background: active ? COLORS.primary : COLORS.panel,
        color: active ? "#fff" : COLORS.ink,
        fontSize: 14,
        fontWeight: 600,
      }}
    >
      {label}
    </button>
  );
}

function BackLink({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: "none",
        border: "none",
        color: COLORS.muted,
        fontSize: 13,
        padding: 0,
      }}
    >
      <ArrowLeft size={15} />
      Back
    </button>
  );
}

/* ------------------------------ Success ------------------------------ */

function SuccessStep({ regId, fee, onDone }) {
  return (
    <div style={{ textAlign: "center", padding: "12px 0" }}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: COLORS.successSoft,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px",
        }}
      >
        <CheckCircle2 size={28} color={COLORS.success} strokeWidth={1.75} />
      </div>
      <h2 style={{ fontFamily: FONTS.serif, fontSize: 19, margin: "0 0 8px" }}>
        Registration Received
      </h2>
      <p
        style={{
          fontSize: 14,
          color: COLORS.inkSoft,
          lineHeight: 1.6,
          margin: "0 0 20px",
        }}
      >
        Thank you for registering. The committee will verify your payment and
        update your status shortly. You can check your status anytime with your
        phone number.
      </p>

      {regId && (
        <div
          style={{
            background: COLORS.bg,
            border: `1px solid ${COLORS.line}`,
            borderRadius: 4,
            padding: "12px 16px",
            marginBottom: 20,
            display: "inline-block",
          }}
        >
          <div style={{ fontSize: 11.5, color: COLORS.muted, marginBottom: 2 }}>
            Registration ID
          </div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: COLORS.primaryDark,
              letterSpacing: 0.5,
            }}
          >
            {regId}
          </div>
        </div>
      )}

      <button
        onClick={onDone}
        style={{
          width: "100%",
          background: COLORS.primary,
          color: "#fff",
          border: "none",
          borderRadius: 4,
          padding: "13px 16px",
          fontSize: 15,
          fontWeight: 600,
        }}
      >
        Done
      </button>
    </div>
  );
}

/* ------------------------------ Status check ------------------------------ */

function StatusCheckStep({
  phone,
  setPhone,
  loading,
  error,
  onBack,
  onSubmit,
}) {
  return (
    <div>
      <BackLink onClick={onBack} />
      <h2
        style={{ fontFamily: FONTS.serif, fontSize: 18, margin: "12px 0 4px" }}
      >
        Check Registration Status
      </h2>
      <p style={{ fontSize: 13.5, color: COLORS.muted, margin: "0 0 20px" }}>
        Enter the phone number used during registration.
      </p>

      <form onSubmit={onSubmit}>
        <Field label="Contact Number" error={error}>
          <TextInput
            icon={Phone}
            placeholder="e.g. 01712345678"
            value={phone}
            onChange={(v) => setPhone(v.replace(/[^0-9]/g, "").slice(0, 11))}
            inputMode="numeric"
          />
        </Field>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            background: COLORS.primary,
            color: "#fff",
            border: "none",
            borderRadius: 4,
            padding: "13px 16px",
            fontSize: 15,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            opacity: loading ? 0.75 : 1,
          }}
        >
          {loading ? (
            <>
              <Loader2
                size={17}
                style={{ animation: "spin 0.8s linear infinite" }}
              />
              Checking
            </>
          ) : (
            <>
              <Search size={16} />
              Check Status
            </>
          )}
        </button>
      </form>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function StatusResultStep({ results, onBack, onHome }) {
  return (
    <div>
      <BackLink onClick={onBack} />
      <h2
        style={{ fontFamily: FONTS.serif, fontSize: 18, margin: "12px 0 16px" }}
      >
        Your Registration
      </h2>

      <div style={{ display: "grid", gap: 12 }}>
        {results.map((r, i) => (
          <StatusCard key={i} data={r} />
        ))}
      </div>

      <button
        onClick={onHome}
        style={{
          width: "100%",
          background: "transparent",
          color: COLORS.primary,
          border: `1px solid ${COLORS.line}`,
          borderRadius: 4,
          padding: "13px 16px",
          fontSize: 14,
          fontWeight: 600,
          marginTop: 20,
        }}
      >
        Back to Home
      </button>
    </div>
  );
}

function StatusCard({ data }) {
  const isPaid = String(data.status).toLowerCase() === "paid";
  return (
    <div
      style={{
        border: `1px solid ${COLORS.line}`,
        borderRadius: 4,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          background: isPaid ? COLORS.successSoft : COLORS.goldSoft,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isPaid ? (
            <CheckCircle2 size={16} color={COLORS.success} />
          ) : (
            <Clock size={16} color={COLORS.primaryDark} />
          )}
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: isPaid ? COLORS.success : COLORS.primaryDark,
            }}
          >
            {isPaid ? "Payment Confirmed" : "Pending Verification"}
          </span>
        </div>
        <span style={{ fontSize: 11.5, color: COLORS.muted, fontWeight: 600 }}>
          {data.regId}
        </span>
      </div>
      <div style={{ padding: "14px 16px", display: "grid", gap: 8 }}>
        <Row label="Name" value={data.name} />
        <Row label="Type" value={data.memberType} />
        <Row label="Category" value={data.category} />
        <Row label="Session / Batch" value={data.session} />
        <Row label="Fee" value={formatTaka(Number(data.fee) || 0)} />
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: 13.5,
      }}
    >
      <span style={{ color: COLORS.muted }}>{label}</span>
      <span style={{ color: COLORS.ink, fontWeight: 500 }}>{value}</span>
    </div>
  );
}
