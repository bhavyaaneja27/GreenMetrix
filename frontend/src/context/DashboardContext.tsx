import React, { createContext, useContext, useState, useEffect } from "react";
import { DateRange, DashboardNotification } from "../types";

export type TopbarDropdown = "search" | "date" | "notifications" | "profile" | null;

interface DashboardContextType {
  dateRange: DateRange;
  setDatePreset: (presetKey: string) => void;
  setCustomDateRange: (startDate: string, endDate: string) => void;
  notifications: DashboardNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  activeDropdown: TopbarDropdown;
  toggleDropdown: (name: Exclude<TopbarDropdown, null>) => void;
  closeAllDropdowns: () => void;
  selectedProject: string;
  setSelectedProject: (project: string) => void;
}

const DEFAULT_DATE_RANGE: DateRange = {
  label: "01 Jan 2024 - 31 May 2026",
  startDate: "2024-01-01",
  endDate: "2026-05-31",
  preset: "all",
};

const INITIAL_NOTIFICATIONS: DashboardNotification[] = [
  {
    id: "notif-01",
    title: "Critical Energy Anomaly Detected",
    message: "Faridabad Heavy Engineering reported a +37% energy surge (5,910 kWh vs 4,300 kWh expected).",
    severity: "HIGH",
    timestamp: "12 mins ago",
    read: false,
    link: "/anomalies",
  },
  {
    id: "notif-02",
    title: "Chiller Baseload Surge Warning",
    message: "Okhla Smart Auto Assembly compressor valve jammed open during idle cycle.",
    severity: "HIGH",
    timestamp: "45 mins ago",
    read: false,
    link: "/anomalies",
  },
  {
    id: "notif-03",
    title: "Renewable Target Update",
    message: "Solar PV generation elevated renewable energy share to 42.8% (+6.5% YTD).",
    severity: "INFO",
    timestamp: "2 hours ago",
    read: false,
    link: "/dashboard",
  },
  {
    id: "notif-04",
    title: "Grid Emission Factor Synchronized",
    message: "CEA Grid Factor updated to 0.716 kg CO₂/kWh for Delhi NCR region.",
    severity: "INFO",
    timestamp: "5 hours ago",
    read: true,
    link: "/settings",
  },
  {
    id: "notif-05",
    title: "Sustainability Score Evaluated",
    message: "GreenMetriX Composite ESG rating updated to 84/100 (Tier A NCR Leader).",
    severity: "MEDIUM",
    timestamp: "1 day ago",
    read: true,
    link: "/score",
  },
];

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const saved = localStorage.getItem("gm_daterange");
    return saved ? JSON.parse(saved) : DEFAULT_DATE_RANGE;
  });

  const [notifications, setNotifications] = useState<DashboardNotification[]>(() => {
    const saved = localStorage.getItem("gm_notifications");
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [activeDropdown, setActiveDropdown] = useState<TopbarDropdown>(null);
  const [selectedProject, setSelectedProject] = useState<string>("All Projects");

  useEffect(() => {
    localStorage.setItem("gm_daterange", JSON.stringify(dateRange));
  }, [dateRange]);

  useEffect(() => {
    localStorage.setItem("gm_notifications", JSON.stringify(notifications));
  }, [notifications]);

  const setDatePreset = (presetKey: string) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const formatDateLabel = (d: Date) => {
      const day = String(d.getDate()).padStart(2, "0");
      const month = d.toLocaleString("en-US", { month: "short" });
      const year = d.getFullYear();
      return `${day} ${month} ${year}`;
    };

    const now = new Date(2026, 8, 26); // reference current project date (26 Sep 2026)

    let start = new Date(now);
    let end = new Date(now);
    let label = "";

    switch (presetKey) {
      case "today":
        label = `Today (${formatDateLabel(now)})`;
        break;
      case "last7":
        start.setDate(now.getDate() - 7);
        label = `Last 7 Days (${formatDateLabel(start)} - ${formatDateLabel(end)})`;
        break;
      case "last30":
        start.setDate(now.getDate() - 30);
        label = `Last 30 Days (${formatDateLabel(start)} - ${formatDateLabel(end)})`;
        break;
      case "last3m":
        start.setMonth(now.getMonth() - 3);
        label = `Last 3 Months (${formatDateLabel(start)} - ${formatDateLabel(end)})`;
        break;
      case "thisYear":
        start = new Date(2026, 0, 1);
        label = `This Year (01 Jan 2026 - ${formatDateLabel(end)})`;
        break;
      case "all":
      default:
        setDateRange(DEFAULT_DATE_RANGE);
        return;
    }

    setDateRange({
      label,
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
      preset: presetKey,
    });
  };

  const setCustomDateRange = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return;
    const formatStr = (s: string) => {
      const parts = s.split("-");
      if (parts.length < 3) return s;
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      const day = String(d.getDate()).padStart(2, "0");
      const month = d.toLocaleString("en-US", { month: "short" });
      return `${day} ${month} ${d.getFullYear()}`;
    };

    setDateRange({
      label: `${formatStr(startDate)} - ${formatStr(endDate)}`,
      startDate,
      endDate,
      preset: "custom",
    });
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const toggleDropdown = (name: Exclude<TopbarDropdown, null>) => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  const closeAllDropdowns = () => {
    setActiveDropdown(null);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <DashboardContext.Provider
      value={{
        dateRange,
        setDatePreset,
        setCustomDateRange,
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        activeDropdown,
        toggleDropdown,
        closeAllDropdowns,
        selectedProject,
        setSelectedProject,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};
