import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import AdminHeader from "../header/admin_header";

const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href =
  "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap";
document.head.appendChild(fontLink);

const styles = {
  container: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    background: "#fff",
    minHeight: "100vh",
    color: "#222",
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    background: "#fff",
    borderBottom: "1px solid #ebebeb",
    padding: "0 40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: 80,
  },
  content: {
    padding: "40px",
    maxWidth: "1600px",
    margin: "0 auto",
  },
  titleSection: {
    marginBottom: 50,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: 800,
    color: "#222",
    margin: "0 0 8px 0",
    letterSpacing: "-0.5px",
  },
  pageSubtitle: {
    fontSize: 16,
    fontWeight: 400,
    color: "#717171",
    margin: 0,
  },
  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: 20,
    marginBottom: 40,
  },
  statCard: {
    background: "#f7f7f7",
    border: "1px solid #ebebeb",
    borderRadius: 16,
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    transition: "all 0.2s",
    cursor: "pointer",
  },
  statCardLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: "#717171",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  statCardValue: {
    fontSize: 36,
    fontWeight: 800,
    color: "#222",
  },
  statCardChange: {
    fontSize: 12,
    fontWeight: 600,
    color: "#2ABE69",
  },
  chartsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))",
    gap: 30,
    marginBottom: 40,
  },
  chartCard: {
    background: "#f7f7f7",
    border: "1px solid #ebebeb",
    borderRadius: 16,
    padding: 24,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#222",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottom: "1px solid #ebebeb",
  },
};

export default function AdminDashboard() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  
  const [stats, setStats] = useState({
    totalApartments: 0,
    totalBookings: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });
  const [apartmentsByDistrict, setApartmentsByDistrict] = useState([]);
  const [unitTypeDistribution, setUnitTypeDistribution] = useState([]);
  const [bookingsOverTime, setBookingsOverTime] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchChartData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, districtRes, unitRes, trendRes] = await Promise.all([
        fetch("http://localhost:5000/api/admin/chart/dashboard-stats", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5000/api/admin/chart/apartments-by-district", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5000/api/admin/chart/unit-type-distribution", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5000/api/admin/chart/bookings-trend", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      if (districtRes.ok) {
        const districtData = await districtRes.json();
        setApartmentsByDistrict(districtData);
      }
      if (unitRes.ok) {
        const unitData = await unitRes.json();
        setUnitTypeDistribution(unitData);
      }
      if (trendRes.ok) {
        const trendData = await trendRes.json();
        setBookingsOverTime(trendData);
      }
    } catch (err) {
      console.error("Error fetching chart data:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchChartData();
    }
  }, [token, fetchChartData]);

  if (!token) {
    return (
      <div style={styles.container}>
        <AdminHeader />
        <div style={styles.content}>
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
            }}
          >
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#FF385C" }}>
              Access Denied
            </h1>
            <p style={{ color: "#717171", fontSize: 16 }}>
              Please login with admin credentials to access this dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <AdminHeader />
      <div style={styles.content}>
        {/* Title Section */}
        <div style={styles.titleSection}>
          <h1 style={styles.pageTitle}>Admin Dashboard</h1>
          <p style={styles.pageSubtitle}>
            Welcome back, {user?.name}. Here's an overview of your platform.
          </p>
        </div>

        {/* Stats Cards */}
        <div style={styles.cardsGrid}>
          <div
            style={styles.statCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={styles.statCardLabel}>Total Apartments</div>
            <div style={styles.statCardValue}>{stats.totalApartments || 0}</div>
            <div style={styles.statCardChange}>↑ 12% from last month</div>
          </div>

          <div
            style={styles.statCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={styles.statCardLabel}>Active Bookings</div>
            <div style={styles.statCardValue}>{stats.totalBookings || 0}</div>
            <div style={styles.statCardChange}>↑ 18% from last month</div>
          </div>

          <div
            style={styles.statCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={styles.statCardLabel}>Registered Users</div>
            <div style={styles.statCardValue}>{stats.totalUsers || 0}</div>
            <div style={styles.statCardChange}>↑ 23% from last month</div>
          </div>

          <div
            style={styles.statCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={styles.statCardLabel}>Revenue</div>
            <div style={styles.statCardValue}>${(stats.totalRevenue / 1000).toFixed(1)}K</div>
            <div style={styles.statCardChange}>↑ 15% from last month</div>
          </div>
        </div>

        {/* Charts Section */}
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "#717171",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 20 }}>⟳</div>
            <p style={{ fontSize: 16 }}>Loading dashboard data...</p>
          </div>
        ) : (
          <div style={styles.chartsGrid}>
            {/* Bar Chart */}
            <div style={styles.chartCard}>
            <div style={styles.chartTitle}>Apartments by District</div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={apartmentsByDistrict}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ebebeb" />
                <XAxis dataKey="district" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    border: "1px solid #ddd",
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="count" fill="#FF385C" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div style={styles.chartCard}>
            <div style={styles.chartTitle}>Unit Type Distribution</div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={unitTypeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={100}
                  fill="#FF385C"
                  dataKey="value"
                >
                  {unitTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    border: "1px solid #ddd",
                    borderRadius: 8,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Line Chart - Full Width */}
          <div style={styles.chartCard}>
          <div style={styles.chartTitle}>Bookings & Applications Trend (6 Months)</div>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={bookingsOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ebebeb" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: 8,
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="bookings"
                stroke="#FF385C"
                strokeWidth={2}
                dot={{ fill: "#FF385C", r: 5 }}
                activeDot={{ r: 7 }}
              />
              <Line
                type="monotone"
                dataKey="applications"
                stroke="#717171"
                strokeWidth={2}
                dot={{ fill: "#717171", r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        </div>
        )}

        {/* Footer */}
        <div
          style={{
            marginTop: 50,
            paddingTop: 30,
            borderTop: "1px solid #ebebeb",
            textAlign: "center",
          }}
        >
          <p style={{ color: "#717171", fontSize: 13, fontWeight: 400 }}>
            Dashboard last updated: {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
