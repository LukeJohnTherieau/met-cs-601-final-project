"use client";

import { useState } from "react";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { JobApplicationProps } from "@/types";

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

// Main component

export default function JobTrackerHome() {
  const API = "/api/job-applications";

  // Fetch all applications
  const { data, error, mutate } = useSWR<JobApplicationProps[]>(API, fetcher);
  const { trigger, isMutating } = useSWRMutation(API, postApplication);

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
      await trigger({
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
      });
      await mutate();
      clearForm();
    } catch (e) {
      console.error(e);
    }
  };

  // Counts for stat cards
  const applications: JobApplicationProps[] = data ?? [];
  const appliedCount = applications.filter(
    (a) => a.status?.toLowerCase() === "applied",
  ).length;
  const interviewCount = applications.filter(
    (a) => a.status?.toLowerCase() === "interview",
  ).length;

  // Styles

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
      minWidth: "780px",
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

    formBody: {
      padding: "1.2rem 1.4rem",
      display: "flex",
      flexDirection: "column",
      gap: "1.2rem",
    } as React.CSSProperties,

    formGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "1rem",
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

    btnPrimary: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "0.875rem",
      fontWeight: 500,
      padding: "9px 20px",
      borderRadius: "10px",
      cursor: "pointer",
      border: "none",
      background: "#1559a8",
      color: "white",
      opacity: isMutating ? 0.6 : 1,
    } as React.CSSProperties,

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
  };

  // Render

  return (
    <div style={s.root}>
      {/* Google Fonts */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@500;700&display=swap');`}</style>

      {/* Nav */}
      <nav style={s.nav}>
        <div style={s.navLogo}>
          <div style={s.navDot} />
          JobTracker
        </div>
        <a style={s.navLink}>Graphs</a>
      </nav>

      {/* Hero */}
      <div style={s.hero}>
        <div>
          <h1 style={s.h1}>
            My Application
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
                    </tr>
                  ))}
                </tbody>
              </table>
              {applications.length === 0 && <EmptyState />}
            </div>
          )}
        </div>

        {/* Form Card */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <span style={s.cardTitle}>Add New Application</span>
            <span style={s.badge("#f1f5f9", "#475569")}>New entry</span>
          </div>
          <div style={s.formBody}>
            {/* Position Info */}
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
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Status</label>
                <select
                  style={s.input}
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
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
                  value={positionType}
                  onChange={(e) => setPositionType(e.target.value)}
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
                  value={dateApplied}
                  onChange={(e) => setDateApplied(e.target.value)}
                />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Starting Pay ($)</label>
                <input
                  style={s.input}
                  type="number"
                  placeholder="e.g. 90000"
                  value={startingPay}
                  onChange={(e) => setStartingPay(e.target.value)}
                />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Ending Pay ($)</label>
                <input
                  style={s.input}
                  type="number"
                  placeholder="e.g. 120000"
                  value={endingPay}
                  onChange={(e) => setEndingPay(e.target.value)}
                />
              </div>
              <div style={s.formGroupFull}>
                <label style={s.label}>Application URL</label>
                <input
                  style={s.input}
                  type="url"
                  placeholder="https://linkedin.com/jobs/..."
                  value={applicationURL}
                  onChange={(e) => setApplicationURL(e.target.value)}
                />
              </div>
            </div>

            {/* Company Info */}
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
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Location</label>
                <input
                  style={s.input}
                  type="text"
                  placeholder="e.g. Boston, MA"
                  value={companyLocation}
                  onChange={(e) => setCompanyLocation(e.target.value)}
                />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Industry</label>
                <input
                  style={s.input}
                  type="text"
                  placeholder="e.g. Marketing Services"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Company URL</label>
                <input
                  style={s.input}
                  type="url"
                  placeholder="https://company.com"
                  value={companyURL}
                  onChange={(e) => setCompanyURL(e.target.value)}
                />
              </div>
            </div>

            <div style={s.formActions}>
              <button style={s.btnSecondary} onClick={clearForm}>
                Clear
              </button>
              <button
                style={s.btnPrimary}
                onClick={handleSubmit}
                disabled={isMutating}
              >
                {isMutating ? "Saving..." : "Add Application"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
