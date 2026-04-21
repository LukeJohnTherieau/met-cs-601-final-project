"use client";

import { useState } from "react";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { JobApplicationProps } from "@/types";
import { Session } from "next-auth"
import { signOut } from "next-auth/react"
import Image from 'next/image'
import Link from "next/link";

// API helpers

const fetcher = (url: string) => fetch(url).then((res) => res.json());

async function postApplication(
  url: string,
  { arg }: { arg: JobApplicationProps },
) {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  }).then((res) => res.json());
}

async function putApplication(
  url: string,
  { arg }: { arg: JobApplicationProps },
) {
  return fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  }).then((res) => res.json());
}

async function deleteApplication(
  url: string,
  { arg }: { arg: {id : string } },
) {
  return fetch(url, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  }).then((res) => res.json());
}

// Status badge

const statusStyles: Record<
  string,
  { background: string; color: string; label: string }
> = {
  applied: { background: "#deeeff", color: "#1559a8", label: "Applied" },
  screening: { background: "#fef3c7", color: "#92400e", label: "Screening" },
  interview: { background: "#ede9fe", color: "#5b21b6", label: "Interview" },
  offer: { background: "#d4f0e2", color: "#0d7340", label: "Offer" },
  rejected: { background: "#fee2e2", color: "#991b1b", label: "Rejected" },
};

function StatusBadge({ status }: { status: string }) {
  const style = statusStyles[status.toLowerCase()] ?? {
    background: "#f1f5f9",
    color: "#475569",
    label: status,
  };
  return (
    <span
      style={{
        background: style.background,
        color: style.color,
        fontSize: "0.72rem",
        fontWeight: 500,
        padding: "3px 10px",
        borderRadius: "20px",
        whiteSpace: "nowrap",
      }}
    >
      {style.label}
    </span>
  );
}

// Empty state

function EmptyState() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "3.5rem 1rem",
        gap: "10px",
      }}
    >
      <div
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "12px",
          background: "#eef4fd",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#a0c4f0"
          strokeWidth="1.5"
        >
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="7" y1="13" x2="10" y2="13" />
          <line x1="7" y1="16" x2="13" y2="16" />
        </svg>
      </div>
      <p style={{ fontSize: "0.92rem", fontWeight: 500, color: "#3a6ba0" }}>
        No applications yet
      </p>
      <p style={{ fontSize: "0.8rem", color: "#93b8d8" }}>
        Fill out the form below to add your first application
      </p>
    </div>
  );
}

// Edit icon

function EditIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#1559a8"
      strokeWidth="2"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
      <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
      <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
    </svg>
  );
}

// Main component
export default function JobTrackerHome({ session }: { session: Session }) {
  const API = `/api/job-applications?email=${session.user?.email}&provider=${session.user?.provider}`;

  const { data, error, mutate } = useSWR<JobApplicationProps[]>(API, fetcher);
  const { trigger: createTrigger, isMutating: isCreating } = useSWRMutation(
    API,
    postApplication,
  );
  const { trigger: updateTrigger, isMutating: isUpdating } = useSWRMutation(
    API,
    putApplication,
  );
  const { trigger: DeleteTrigger, isMutating: isDeleting } = useSWRMutation(
    API,
    deleteApplication,
  );

  // Add form state
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("applied");
  const [positionType, setPositionType] = useState("Full-time");
  const [dateApplied, setDateApplied] = useState("");
  const [startingPay, setStartingPay] = useState("");
  const [endingPay, setEndingPay] = useState("");
  const [applicationURL, setApplicationURL] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyLocation, setCompanyLocation] = useState("");
  const [industry, setIndustry] = useState("");
  const [companyURL, setCompanyURL] = useState("");

  //  Edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editStatus, setEditStatus] = useState("applied");
  const [editPositionType, setEditPositionType] = useState("Full-time");
  const [editDateApplied, setEditDateApplied] = useState("");
  const [editStartingPay, setEditStartingPay] = useState("");
  const [editEndingPay, setEditEndingPay] = useState("");
  const [editApplicationURL, setEditApplicationURL] = useState("");
  const [editCompanyName, setEditCompanyName] = useState("");
  const [editCompanyLocation, setEditCompanyLocation] = useState("");
  const [editIndustry, setEditIndustry] = useState("");
  const [editCompanyURL, setEditCompanyURL] = useState("");

  // Open edit modal pre-filled
  const openEdit = (app: JobApplicationProps) => {
    setEditId(String(app._id));
    setEditTitle(app.title);
    setEditStatus(app.status);
    setEditPositionType(app.positionType);
    setEditDateApplied(new Date(app.dateApplied).toISOString().split("T")[0]);
    setEditStartingPay(String(app.startingPay));
    setEditEndingPay(String(app.endingPay));
    setEditApplicationURL(app.applicationURL ?? "");
    setEditCompanyName(app.company.name);
    setEditCompanyLocation(app.company.location ?? "");
    setEditIndustry(app.company.industries?.[0] ?? "");
    setEditCompanyURL(app.company.companyURL ?? "");
    setEditOpen(true);
  };

  const closeEdit = () => setEditOpen(false);

  // Save edited application
  const handleUpdate = async () => {
    if (!editTitle || !editDateApplied || !editCompanyName) return;
    try {
      await updateTrigger({
        _id: editId,
        title: editTitle,
        dateApplied: new Date(editDateApplied),
        status: editStatus,
        applicationURL: editApplicationURL,
        positionType: editPositionType,
        startingPay: Number(editStartingPay),
        endingPay: Number(editEndingPay),
        company: {
          name: editCompanyName,
          location: editCompanyLocation,
          industries: editIndustry ? [editIndustry] : [],
          companyURL: editCompanyURL,
        },
        user: {
          email: session.user?.email,
          provider: session.user?.provider
        }
      });
      await mutate();
      closeEdit();
    } catch (e) {
      console.error(e);
    }
  };

  // Add form handlers
  const clearForm = () => {
    setTitle("");
    setStatus("applied");
    setPositionType("Full-time");
    setDateApplied("");
    setStartingPay("");
    setEndingPay("");
    setApplicationURL("");
    setCompanyName("");
    setCompanyLocation("");
    setIndustry("");
    setCompanyURL("");
  };

  const handleSubmit = async () => {
    if (!title || !dateApplied || !companyName) return;
    try {
      await createTrigger({
        title,
        dateApplied: new Date(dateApplied),
        status,
        applicationURL,
        positionType,
        startingPay: Number(startingPay),
        endingPay: Number(endingPay),
        company: {
          name: companyName,
          location: companyLocation,
          industries: industry ? [industry] : [],
          companyURL,
        },
        user: {
          email: session.user?.email,
          provider: session.user?.provider
        }
      });
      await mutate();
      clearForm();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (app:JobApplicationProps) => {
    if (app._id && typeof app._id === "string") {
      try {
        await DeleteTrigger(
          {
            id : app._id
          }

        );
        await mutate();
        clearForm();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const applications: JobApplicationProps[] = data ?? [];
  const appliedCount = applications.filter(
    (a) => a.status?.toLowerCase() === "applied",
  ).length;
  const interviewCount = applications.filter(
    (a) => a.status?.toLowerCase() === "interview",
  ).length;

  //  Styles

  const s = {
    root: {
      fontFamily: "'DM Sans', sans-serif",
      background: "#deeeff",
      minHeight: "100vh",
      color: "#1a2a3a",
    } as React.CSSProperties,
    nav: {
      background: "rgba(255,255,255,0.85)",
      borderBottom: "1px solid rgba(100,160,230,0.2)",
      padding: "0 2rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: "58px",
      position: "sticky",
      top: 0,
      zIndex: 100,
    } as React.CSSProperties,
    navLogo: {
      fontFamily: "'Syne', sans-serif",
      fontSize: "1.25rem",
      fontWeight: 700,
      color: "#1559a8",
      letterSpacing: "-0.02em",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    } as React.CSSProperties,
    navDot: {
      width: "9px",
      height: "9px",
      background: "#3b82f6",
      borderRadius: "50%",
    } as React.CSSProperties,
    profilePicture: {
      borderRadius: "50%",
      objectFit: "cover",
      margin: "5px",
    } as React.CSSProperties,
    navLink: {
      fontSize: "0.9rem",
      fontWeight: 500,
      color: "#1559a8",
      padding: "6px 18px",
      borderRadius: "20px",
      border: "1.5px solid #a0c4f0",
      background: "rgba(59,130,246,0.07)",
      cursor: "pointer",
      textDecoration: "none",
    } as React.CSSProperties,
    navSignOutButton: {
      fontSize: "0.9rem",
      fontWeight: 500,
      color: "red",
      padding: "6px 18px",
      margin: "0px 12px",
      borderRadius: "20px",
      border: "1.5px solid #FF7575",
      background: "#FFD9D9",
      cursor: "pointer",
      textDecoration: "none",
    } as React.CSSProperties,
    hero: {
      padding: "2.5rem 2rem 1.5rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    } as React.CSSProperties,
    h1: {
      fontFamily: "'Syne', sans-serif",
      fontSize: "2rem",
      fontWeight: 700,
      color: "#0d3a72",
      letterSpacing: "-0.03em",
      lineHeight: 1.15,
    } as React.CSSProperties,
    heroSub: {
      fontSize: "0.95rem",
      color: "#3a6ba0",
      marginTop: "6px",
    } as React.CSSProperties,
    stats: { display: "flex", gap: "12px" } as React.CSSProperties,
    stat: {
      background: "white",
      borderRadius: "14px",
      padding: "14px 28px",
      textAlign: "center",
      border: "1px solid rgba(100,160,230,0.25)",
      minWidth: "100px",
    } as React.CSSProperties,
    statNum: {
      fontFamily: "'Syne', sans-serif",
      fontSize: "1.6rem",
      fontWeight: 700,
      color: "#1559a8",
    } as React.CSSProperties,
    statLbl: {
      fontSize: "0.72rem",
      color: "#6b90b8",
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      marginTop: "2px",
    } as React.CSSProperties,
    content: {
      padding: "0 2rem 2rem",
      display: "flex",
      flexDirection: "column",
      gap: "1.5rem",
    } as React.CSSProperties,
    card: {
      background: "white",
      borderRadius: "18px",
      border: "1px solid rgba(100,160,230,0.22)",
      overflow: "hidden",
    } as React.CSSProperties,
    cardHeader: {
      padding: "1rem 1.4rem 0.75rem",
      borderBottom: "1px solid rgba(100,160,230,0.15)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    } as React.CSSProperties,
    cardTitle: {
      fontFamily: "'Syne', sans-serif",
      fontSize: "1rem",
      fontWeight: 700,
      color: "#0d3a72",
    } as React.CSSProperties,
    badge: (bg: string, color: string) =>
      ({
        fontSize: "0.72rem",
        fontWeight: 500,
        padding: "3px 10px",
        borderRadius: "20px",
        background: bg,
        color,
      }) as React.CSSProperties,
    tblWrap: { overflowX: "auto" } as React.CSSProperties,
    table: {
      width: "100%",
      borderCollapse: "collapse",
      minWidth: "860px",
    } as React.CSSProperties,
    th: {
      fontSize: "0.72rem",
      fontWeight: 500,
      color: "#6b90b8",
      textTransform: "uppercase",
      letterSpacing: "0.07em",
      padding: "0.6rem 1.1rem",
      textAlign: "left",
      borderBottom: "1px solid rgba(100,160,230,0.12)",
      whiteSpace: "nowrap",
    } as React.CSSProperties,
    td: {
      fontSize: "0.83rem",
      padding: "0.65rem 1.1rem",
      borderBottom: "1px solid rgba(100,160,230,0.08)",
      verticalAlign: "middle",
    } as React.CSSProperties,
    editBtn: {
      display: "flex",
      alignItems: "center",
      gap: "5px",
      fontSize: "0.78rem",
      fontWeight: 500,
      color: "#1559a8",
      background: "#eef4ff",
      border: "1.5px solid #c5daf5",
      borderRadius: "7px",
      padding: "4px 10px",
      cursor: "pointer",
      whiteSpace: "nowrap",
    } as React.CSSProperties,
    formBody: {
      padding: "1.2rem 1.4rem",
      display: "flex",
      flexDirection: "column",
      gap: "1.75rem",
    } as React.CSSProperties,
    formGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "1.5rem",
    } as React.CSSProperties,
    formGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "5px",
    } as React.CSSProperties,
    formGroupFull: {
      display: "flex",
      flexDirection: "column",
      gap: "5px",
      gridColumn: "1 / -1",
    } as React.CSSProperties,
    label: {
      fontSize: "0.78rem",
      fontWeight: 500,
      color: "#3a6ba0",
      letterSpacing: "0.02em",
    } as React.CSSProperties,
    input: {
      border: "1.5px solid #c5daf5",
      borderRadius: "9px",
      padding: "9px 12px",
      fontSize: "0.875rem",
      fontFamily: "'DM Sans', sans-serif",
      background: "#ffffff",
      color: "#1a2a3a",
      outline: "none",
      width: "100%",
    } as React.CSSProperties,
    dividerRow: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
    } as React.CSSProperties,
    dividerLabel: {
      fontSize: "0.72rem",
      fontWeight: 500,
      color: "#6b90b8",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      whiteSpace: "nowrap",
    } as React.CSSProperties,
    dividerLine: {
      flex: 1,
      height: "1px",
      background: "rgba(100,160,230,0.2)",
    } as React.CSSProperties,
    formActions: {
      display: "flex",
      gap: "10px",
      justifyContent: "flex-end",
      paddingTop: "4px",
    } as React.CSSProperties,
    btnPrimary: (loading: boolean) =>
      ({
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "0.875rem",
        fontWeight: 500,
        padding: "9px 20px",
        borderRadius: "10px",
        cursor: "pointer",
        border: "none",
        background: "#1559a8",
        color: "white",
        opacity: loading ? 0.6 : 1,
      }) as React.CSSProperties,
    btnSecondary: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "0.875rem",
      fontWeight: 500,
      padding: "9px 20px",
      borderRadius: "10px",
      cursor: "pointer",
      background: "rgba(100,160,230,0.15)",
      color: "#1559a8",
      border: "1.5px solid rgba(100,160,230,0.35)",
    } as React.CSSProperties,
    overlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(10,30,60,0.4)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 200,
      padding: "1rem",
    } as React.CSSProperties,
    modal: {
      background: "white",
      borderRadius: "20px",
      border: "1px solid rgba(100,160,230,0.25)",
      width: "100%",
      maxWidth: "640px",
      maxHeight: "90vh",
      overflowY: "auto",
    } as React.CSSProperties,
    modalHeader: {
      padding: "1.1rem 1.4rem",
      borderBottom: "1px solid rgba(100,160,230,0.15)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      background: "white",
      zIndex: 1,
    } as React.CSSProperties,
    modalTitle: {
      fontFamily: "'Syne', sans-serif",
      fontSize: "1rem",
      fontWeight: 700,
      color: "#0d3a72",
    } as React.CSSProperties,
    modalClose: {
      width: "30px",
      height: "30px",
      borderRadius: "8px",
      background: "#f1f5f9",
      border: "none",
      cursor: "pointer",
      fontSize: "1rem",
      color: "#6b90b8",
    } as React.CSSProperties,
    modalFooter: {
      padding: "1rem 1.4rem",
      borderTop: "1px solid rgba(100,160,230,0.15)",
      display: "flex",
      gap: "10px",
      justifyContent: "flex-end",
      position: "sticky",
      bottom: 0,
      background: "white",
    } as React.CSSProperties,
  };

  // Shared form fields

  const renderFormFields = (
    vals: {
      title: string;
      status: string;
      positionType: string;
      dateApplied: string;
      startingPay: string;
      endingPay: string;
      applicationURL: string;
      companyName: string;
      companyLocation: string;
      industry: string;
      companyURL: string;
    },
    setters: {
      setTitle: (v: string) => void;
      setStatus: (v: string) => void;
      setPositionType: (v: string) => void;
      setDateApplied: (v: string) => void;
      setStartingPay: (v: string) => void;
      setEndingPay: (v: string) => void;
      setApplicationURL: (v: string) => void;
      setCompanyName: (v: string) => void;
      setCompanyLocation: (v: string) => void;
      setIndustry: (v: string) => void;
      setCompanyURL: (v: string) => void;
    },
  ) => (
    <>
      <div style={s.dividerRow}>
        <span style={s.dividerLabel}>Position Info</span>
        <div style={s.dividerLine} />
      </div>
      <div style={s.formGrid}>
        <div style={s.formGroup}>
          <label style={s.label}>Position Title</label>
          <input
            style={s.input}
            type="text"
            placeholder="e.g. Frontend Engineer"
            value={vals.title}
            onChange={(e) => setters.setTitle(e.target.value)}
          />
        </div>
        <div style={s.formGroup}>
          <label style={s.label}>Status</label>
          <select
            style={s.input}
            value={vals.status}
            onChange={(e) => setters.setStatus(e.target.value)}
          >
            <option value="applied">Applied</option>
            <option value="screening">Screening</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div style={s.formGroup}>
          <label style={s.label}>Position Type</label>
          <select
            style={s.input}
            value={vals.positionType}
            onChange={(e) => setters.setPositionType(e.target.value)}
          >
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Contract</option>
            <option>Internship</option>
          </select>
        </div>
        <div style={s.formGroup}>
          <label style={s.label}>Date Applied</label>
          <input
            style={s.input}
            type="date"
            value={vals.dateApplied}
            onChange={(e) => setters.setDateApplied(e.target.value)}
          />
        </div>
        <div style={s.formGroup}>
          <label style={s.label}>Starting Pay ($)</label>
          <input
            style={s.input}
            type="number"
            placeholder="e.g. 90000"
            value={vals.startingPay}
            onChange={(e) => setters.setStartingPay(e.target.value)}
          />
        </div>
        <div style={s.formGroup}>
          <label style={s.label}>Ending Pay ($)</label>
          <input
            style={s.input}
            type="number"
            placeholder="e.g. 120000"
            value={vals.endingPay}
            onChange={(e) => setters.setEndingPay(e.target.value)}
          />
        </div>
        <div style={s.formGroupFull}>
          <label style={s.label}>Application URL</label>
          <input
            style={s.input}
            type="url"
            placeholder="https://linkedin.com/jobs/..."
            value={vals.applicationURL}
            onChange={(e) => setters.setApplicationURL(e.target.value)}
          />
        </div>
      </div>
      <div style={s.dividerRow}>
        <span style={s.dividerLabel}>Company Info</span>
        <div style={s.dividerLine} />
      </div>
      <div style={s.formGrid}>
        <div style={s.formGroup}>
          <label style={s.label}>Company Name</label>
          <input
            style={s.input}
            type="text"
            placeholder="e.g. Klaviyo"
            value={vals.companyName}
            onChange={(e) => setters.setCompanyName(e.target.value)}
          />
        </div>
        <div style={s.formGroup}>
          <label style={s.label}>Location</label>
          <input
            style={s.input}
            type="text"
            placeholder="e.g. Boston, MA"
            value={vals.companyLocation}
            onChange={(e) => setters.setCompanyLocation(e.target.value)}
          />
        </div>
        <div style={s.formGroup}>
          <label style={s.label}>Industry</label>
          <input
            style={s.input}
            type="text"
            placeholder="e.g. Marketing Services"
            value={vals.industry}
            onChange={(e) => setters.setIndustry(e.target.value)}
          />
        </div>
        <div style={s.formGroup}>
          <label style={s.label}>Company URL</label>
          <input
            style={s.input}
            type="url"
            placeholder="https://company.com"
            value={vals.companyURL}
            onChange={(e) => setters.setCompanyURL(e.target.value)}
          />
        </div>
      </div>
    </>
  );

  // Render

  return (
    <div style={s.root}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@500;700&display=swap');`}</style>

      {/* Edit Modal */}
      {editOpen && (
        <div style={s.overlay} onClick={closeEdit}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <span style={s.modalTitle}>Edit Application</span>
              <button style={s.modalClose} onClick={closeEdit}>
                ✕
              </button>
            </div>
            <div style={s.formBody}>
              {renderFormFields(
                {
                  title: editTitle,
                  status: editStatus,
                  positionType: editPositionType,
                  dateApplied: editDateApplied,
                  startingPay: editStartingPay,
                  endingPay: editEndingPay,
                  applicationURL: editApplicationURL,
                  companyName: editCompanyName,
                  companyLocation: editCompanyLocation,
                  industry: editIndustry,
                  companyURL: editCompanyURL,
                },
                {
                  setTitle: setEditTitle,
                  setStatus: setEditStatus,
                  setPositionType: setEditPositionType,
                  setDateApplied: setEditDateApplied,
                  setStartingPay: setEditStartingPay,
                  setEndingPay: setEditEndingPay,
                  setApplicationURL: setEditApplicationURL,
                  setCompanyName: setEditCompanyName,
                  setCompanyLocation: setEditCompanyLocation,
                  setIndustry: setEditIndustry,
                  setCompanyURL: setEditCompanyURL,
                },
              )}
            </div>
            <div style={s.modalFooter}>
              <button style={s.btnSecondary} onClick={closeEdit}>
                Cancel
              </button>
              <button
                style={s.btnPrimary(isUpdating)}
                onClick={handleUpdate}
                disabled={isUpdating}
              >
                {isUpdating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={s.nav}>
        <div style={s.navLogo}>
          <div style={s.navDot} />
          JobTracker
        </div>
        <div>
          <button style={s.navSignOutButton} onClick={() => signOut()}>Sign out</button>
           <Link href="/graph" style={s.navLink}>Graphs</Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={s.hero}>
        {session?.user?.image ? (
          <Image
            style={s.profilePicture}
            src={session.user.image}
            width={150}
            height={150}
            alt={`Profile Picture`}
            priority={true}
          />
        ) : null}
        <div>
          <h1 style={s.h1}>
            {session.user?.name}&apos;s Application
            <br />
            Dashboard
          </h1>
          <p style={s.heroSub}>
            Track every opportunity — from applied to offer.
          </p>
        </div>
        <div style={s.stats}>
          <div style={s.stat}>
            <div style={s.statNum}>{appliedCount}</div>
            <div style={s.statLbl}>Applied</div>
          </div>
          <div style={s.stat}>
            <div style={s.statNum}>{interviewCount}</div>
            <div style={s.statLbl}>Interviews</div>
          </div>
        </div>
      </div>

      <div style={s.content}>
        {/* Table Card */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <span style={s.cardTitle}>Job Applications</span>
            <span style={s.badge("#f1f5f9", "#475569")}>
              {applications.length} total
            </span>
          </div>
          {error && (
            <p
              style={{
                padding: "1rem 1.4rem",
                color: "#991b1b",
                fontSize: "0.875rem",
              }}
            >
              Failed to load applications.
            </p>
          )}
          {!data && !error && (
            <p
              style={{
                padding: "1rem 1.4rem",
                color: "#6b90b8",
                fontSize: "0.875rem",
              }}
            >
              Loading...
            </p>
          )}
          {data && (
            <div style={s.tblWrap}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {[
                      "Position Title",
                      "Company",
                      "Date Applied",
                      "Status",
                      "Type",
                      "Pay Range",
                      "App URL",
                      "Edit",
                      "Delete",
                    ].map((h) => (
                      <th key={h} style={s.th}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={String(app._id)}>
                      <td style={s.td}>{app.title}</td>
                      <td style={s.td}>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "2px",
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 500,
                              fontSize: "0.85rem",
                              color: "#0d3a72",
                            }}
                          >
                            {app.company.name}
                          </span>
                          <span
                            style={{ fontSize: "0.75rem", color: "#6b90b8" }}
                          >
                            {app.company.location}
                          </span>
                        </div>
                      </td>
                      <td style={s.td}>
                        {new Date(app.dateApplied).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td style={s.td}>
                        <StatusBadge status={app.status} />
                      </td>
                      <td style={s.td}>{app.positionType}</td>
                      <td style={s.td}>
                        {app.startingPay && app.endingPay
                          ? `$${(app.startingPay / 1000).toFixed(0)}k – $${(app.endingPay / 1000).toFixed(0)}k`
                          : "—"}
                      </td>
                      <td style={s.td}>
                        {app.applicationURL ? (
                          <a
                            href={app.applicationURL}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              fontSize: "0.78rem",
                              color: "#1559a8",
                              textDecoration: "underline",
                            }}
                          >
                            View
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td style={s.td}>
                        <button style={s.editBtn} onClick={() => openEdit(app)}>
                          <EditIcon /> Edit
                        </button>
                      </td>
                      <td style={s.td}>
                        <button style={s.editBtn} onClick={() => handleDelete(app)} disabled={isDeleting}>
                          <DeleteIcon />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {applications.length === 0 && <EmptyState />}
            </div>
          )}
        </div>

        {/* Add Form Card */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <span style={s.cardTitle}>Add New Application</span>
            <span style={s.badge("#f1f5f9", "#475569")}>New entry</span>
          </div>
          <div style={s.formBody}>
            {renderFormFields(
              {
                title,
                status,
                positionType,
                dateApplied,
                startingPay,
                endingPay,
                applicationURL,
                companyName,
                companyLocation,
                industry,
                companyURL,
              },
              {
                setTitle,
                setStatus,
                setPositionType,
                setDateApplied,
                setStartingPay,
                setEndingPay,
                setApplicationURL,
                setCompanyName,
                setCompanyLocation,
                setIndustry,
                setCompanyURL,
              },
            )}
            <div style={s.formActions}>
              <button style={s.btnSecondary} onClick={clearForm}>
                Clear
              </button>
              <button
                style={s.btnPrimary(isCreating)}
                onClick={handleSubmit}
                disabled={isCreating}
              >
                {isCreating ? "Saving..." : "Add Application"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
