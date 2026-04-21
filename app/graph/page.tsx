"use client";

// Графики из библиотеки react-chartjs-2
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS, BarElement, CategoryScale, LinearScale,
  Tooltip, Legend, ArcElement, PointElement, LineElement, Filler,
} from "chart.js";

// Хук для работы с сессией пользователя
import { useSession, signOut } from "next-auth/react";
// Хук для загрузки данных с сервера
import useSWR from "swr";
// Ссылки Next.js
import Link from "next/link";
// Наши стили
import styles from "./graph.module.css";

// Регистрируем все компоненты Chart.js (обязательно)
ChartJS.register(
  CategoryScale, LinearScale, BarElement, Tooltip, Legend,
  ArcElement, PointElement, LineElement, Filler
);

// ─── Тип данных одной заявки (должен совпадать с базой данных) ───────────────

interface JobApplication {
  _id?: string;
  title: string;
  status: string;
  positionType: string;
  dateApplied: string | Date;
  startingPay?: number;
  endingPay?: number;
  company: {
    name: string;
    location?: string;
    industries?: string[];
  };
}

// ─── Функция загрузки данных (передаём в useSWR) ─────────────────────────────

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// ─── Цвета и названия для каждого статуса ────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  applied:   { label: "Applied",   color: "#1559a8", bg: "#deeeff" },
  screening: { label: "Screening", color: "#92400e", bg: "#fef3c7" },
  interview: { label: "Interview", color: "#5b21b6", bg: "#ede9fe" },
  offer:     { label: "Offer",     color: "#0d7340", bg: "#d4f0e2" },
  rejected:  { label: "Rejected",  color: "#991b1b", bg: "#fee2e2" },
};

// ─── Маленький компонент: карточка с одной цифрой статистики ─────────────────

function StatCard({ label, value, sub, accent }: {
  label: string;
  value: number | string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className={styles.statCard}>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue} style={{ color: accent ?? "#0d3a72" }}>
        {value}
      </span>
      {sub && <span className={styles.statSub}>{sub}</span>}
    </div>
  );
}

// ─── Маленький компонент: белая карточка с заголовком (обёртка для графиков) ──

function CardWrap({ title, badge, children }: {
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardTitle}>{title}</span>
        {badge && <span className={styles.cardBadge}>{badge}</span>}
      </div>
      <div className={styles.cardBody}>{children}</div>
    </div>
  );
}

// ─── Маленький компонент: заглушка когда нет данных для графика ───────────────

function EmptyChart({ message }: { message: string }) {
  return (
    <div className={styles.emptyChart}>
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#a0c4f0" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M9 17V13M12 17V9M15 17V11" />
      </svg>
      {message}
    </div>
  );
}

// ─── Главный компонент страницы ───────────────────────────────────────────────

export default function GraphPage() {

  // Получаем данные текущего пользователя и статус сессии
  const { data: session, status } = useSession();

  // Строим URL для запроса заявок — только если пользователь вошёл
  const API =
    status === "authenticated" && session?.user?.email
      ? `/api/job-applications?email=${session.user.email}&provider=${
          (session.user as { provider?: string }).provider ?? ""
        }`
      : null;

  // Загружаем заявки с сервера через SWR (автоматически обновляется)
  const { data, error } = useSWR<JobApplication[]>(API, fetcher);

  // Пока сессия грузится — показываем заглушку
  if (status === "loading") {
    return <div className={styles.loading}>Loading session...</div>;
  }

  // Если не вошёл — предлагаем войти
  if (status === "unauthenticated") {
    return (
      <div className={styles.unauthenticated}>
        <p>You need to sign in to view analytics.</p>
        <Link href="/" className={styles.unauthBtn}>Go to sign in</Link>
      </div>
    );
  }

  // ── Считаем статистику из загруженных данных ──────────────────────────────

  const applications: JobApplication[] = Array.isArray(data) ? data : [];
  const total = applications.length;

  // Считаем сколько заявок с каждым статусом
  const statusCounts = Object.keys(STATUS_CONFIG).reduce((acc, key) => {
    acc[key] = applications.filter((a) => a.status?.toLowerCase() === key).length;
    return acc;
  }, {} as Record<string, number>);

  // Процент офферов и собеседований от всех заявок
  const offerRate = total > 0 ? Math.round((statusCounts.offer / total) * 100) : 0;
  const interviewRate = total > 0
    ? Math.round(((statusCounts.interview + statusCounts.offer) / total) * 100)
    : 0;

  // Средняя зарплата (только по тем у кого указана)
  const paidApps = applications.filter(
    (a) => a.startingPay && a.endingPay && a.startingPay > 0 && a.endingPay > 0
  );
  const avgPay = paidApps.length > 0
    ? Math.round(
        paidApps.reduce((sum, a) => sum + (a.startingPay! + a.endingPay!) / 2, 0)
        / paidApps.length
      )
    : 0;

  // Количество заявок по месяцам (последние 6 месяцев) — для линейного графика
  const now = new Date();
  const monthLabels: string[] = [];
  const monthCounts: number[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthLabels.push(d.toLocaleString("en-US", { month: "short", year: "2-digit" }));
    monthCounts.push(
      applications.filter((a) => {
        const ad = new Date(a.dateApplied);
        return ad.getFullYear() === d.getFullYear() && ad.getMonth() === d.getMonth();
      }).length
    );
  }

  // Топ компаний по количеству заявок — для bar графика
  const companyCounts: Record<string, number> = {};
  applications.forEach((a) => {
    const n = a.company?.name ?? "Unknown";
    companyCounts[n] = (companyCounts[n] ?? 0) + 1;
  });
  const topCompanies = Object.entries(companyCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // Количество заявок по типу позиции (Full-time, Part-time и т.д.)
  const typeCounts: Record<string, number> = {};
  applications.forEach((a) => {
    const t = a.positionType ?? "Other";
    typeCounts[t] = (typeCounts[t] ?? 0) + 1;
  });

  // ── Данные для каждого графика ────────────────────────────────────────────

  // Круговой график (Doughnut) — разбивка по статусам
  const doughnutData = {
    labels: Object.values(STATUS_CONFIG).map((s) => s.label),
    datasets: [{
      data: Object.keys(STATUS_CONFIG).map((k) => statusCounts[k]),
      backgroundColor: Object.values(STATUS_CONFIG).map((s) => s.bg),
      borderColor: Object.values(STATUS_CONFIG).map((s) => s.color),
      borderWidth: 2,
      hoverOffset: 6,
    }],
  };

  // Линейный график — заявки по месяцам
  const lineData = {
    labels: monthLabels,
    datasets: [{
      label: "Applications",
      data: monthCounts,
      fill: true,
      backgroundColor: "rgba(21,89,168,0.08)",
      borderColor: "#1559a8",
      borderWidth: 2.5,
      pointBackgroundColor: "#1559a8",
      pointRadius: 5,
      tension: 0.35,
    }],
  };

  // Bar график — топ компаний
  const barData = {
    labels: topCompanies.map(([name]) => name.length > 16 ? name.slice(0, 14) + "…" : name),
    datasets: [{
      label: "Applications",
      data: topCompanies.map(([, count]) => count),
      backgroundColor: "rgba(21,89,168,0.75)",
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  // Bar график — типы позиций
  const typeBarData = {
    labels: Object.keys(typeCounts),
    datasets: [{
      label: "Count",
      data: Object.values(typeCounts),
      backgroundColor: [
        "rgba(21,89,168,0.75)", "rgba(91,33,182,0.75)", "rgba(13,115,64,0.75)",
        "rgba(146,64,14,0.75)", "rgba(153,27,27,0.75)",
      ],
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  // Общие настройки для bar графиков
  const barOptions = {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: "#0d3a72" } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: "DM Sans", size: 11 }, color: "#6b90b8" } },
      y: { grid: { color: "rgba(100,160,230,0.12)" }, ticks: { font: { family: "DM Sans", size: 11 }, color: "#6b90b8", stepSize: 1, precision: 0 }, beginAtZero: true },
    },
  };

  // Настройки для линейного графика
  const lineOptions = {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: "#0d3a72" } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: "DM Sans", size: 11 }, color: "#6b90b8" } },
      y: { grid: { color: "rgba(100,160,230,0.12)" }, ticks: { font: { family: "DM Sans", size: 11 }, color: "#6b90b8", stepSize: 1, precision: 0 }, beginAtZero: true },
    },
  };

  // Настройки для кругового графика
  const doughnutOptions = {
    responsive: true,
    cutout: "68%",
    plugins: {
      legend: { position: "bottom" as const, labels: { font: { family: "DM Sans", size: 11 }, color: "#3a6ba0", boxWidth: 12, padding: 14 } },
      tooltip: { backgroundColor: "#0d3a72" },
    },
  };

  // ── Рендер страницы ───────────────────────────────────────────────────────

  return (
    <div className={styles.root}>

      {/* Навбар */}
      <nav className={styles.nav}>
        <div className={styles.navLogo}>
          <div className={styles.navDot} />
          JobTracker
        </div>
        <div className={styles.navActions}>
          <button className={styles.navSignOut} onClick={() => signOut()}>Sign out</button>
          <Link href="/" className={styles.navBack}>← Dashboard</Link>
        </div>
      </nav>

      {/* Заголовок страницы */}
      <div className={styles.hero}>
        <div>
          <h1 className={styles.heroTitle}>Graphs &amp; Analytics</h1>
          <p className={styles.heroSub}>Visual overview of your job search progress.</p>
        </div>
        <span className={styles.heroBadge}>{total} application{total !== 1 ? "s" : ""} total</span>
      </div>

      {/* Основной контент */}
      <div className={styles.content}>

        {/* Сообщения об ошибке или загрузке */}
        {error && <p className={styles.errorMsg}>Failed to load data.</p>}
        {!data && !error && <p className={styles.loadingMsg}>Loading...</p>}

        {/* Всё остальное показываем только когда данные загружены */}
        {data && (
          <>
            {/* Ряд карточек со статистикой */}
            <div className={styles.statsRow}>
              <StatCard label="Total Applied" value={total} />
              <StatCard label="Interviews" value={statusCounts.interview + statusCounts.offer} sub={`${interviewRate}% of applications`} accent="#5b21b6" />
              <StatCard label="Offers" value={statusCounts.offer} sub={`${offerRate}% offer rate`} accent="#0d7340" />
              <StatCard label="Rejected" value={statusCounts.rejected} accent="#991b1b" />
              {avgPay > 0 && (
                <StatCard label="Avg. Salary" value={`$${(avgPay / 1000).toFixed(0)}k`} sub={`from ${paidApps.length} listings`} accent="#1559a8" />
              )}
            </div>

            {/* Круговой график + Линейный график */}
            <div className={styles.grid2Left}>
              <CardWrap title="Status Breakdown" badge={`${total} total`}>
                {total === 0
                  ? <EmptyChart message="No applications to display" />
                  : <div className={styles.doughnutWrap}><Doughnut data={doughnutData} options={doughnutOptions} /></div>
                }
              </CardWrap>
              <CardWrap title="Applications Over Time" badge="Last 6 months">
                {total === 0 ? <EmptyChart message="No data yet" /> : <Line data={lineData} options={lineOptions} />}
              </CardWrap>
            </div>

            {/* Bar график компаний + Bar график типов */}
            <div className={styles.grid2Right}>
              <CardWrap title="Top Companies Applied To" badge={`Top ${topCompanies.length}`}>
                {topCompanies.length === 0 ? <EmptyChart message="No companies yet" /> : <Bar data={barData} options={barOptions} />}
              </CardWrap>
              <CardWrap title="By Position Type">
                {Object.keys(typeCounts).length === 0 ? <EmptyChart message="No data yet" /> : <Bar data={typeBarData} options={barOptions} />}
              </CardWrap>
            </div>

            {/* Цветные тайлы по каждому статусу */}
            <CardWrap title="Status Summary">
              <div className={styles.statusGrid}>
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <div key={key} className={styles.statusTile} style={{ background: cfg.bg }}>
                    <span className={styles.statusTileLabel} style={{ color: cfg.color }}>{cfg.label}</span>
                    <span className={styles.statusTileValue} style={{ color: cfg.color }}>{statusCounts[key]}</span>
                    <span className={styles.statusTilePercent} style={{ color: cfg.color }}>
                      {total > 0 ? Math.round((statusCounts[key] / total) * 100) : 0}% of total
                    </span>
                  </div>
                ))}
              </div>
            </CardWrap>
          </>
        )}
      </div>
    </div>
  );
}