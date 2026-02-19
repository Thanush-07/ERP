import { useAuth } from '@/contexts/AuthContext';
import {
  User,
  Building2,
  Calendar,
  GraduationCap,
  AlertTriangle,
  Users,
  BookOpen,
  FileText,
  Target,
  TrendingUp,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
} from 'recharts';
import "../../../Company_admin/styles/CompanyDashboard.css";

// Mock data
const dashboardData = {
  semesterAttendance: 82.5,
  yearAttendance: 78.3,
  cgpa: 8.45,
  totalCredits: 120,
  earnedCredits: 90,
  attendanceData: [
    { name: 'Present', value: 82.5, color: '#0d9488' },
    { name: 'Absent', value: 17.5, color: '#991b1b' },
  ],
  gpaTrend: [
    { sem: 'Sem 1', gpa: 7.8 },
    { sem: 'Sem 2', gpa: 8.0 },
    { sem: 'Sem 3', gpa: 8.2 },
    { sem: 'Sem 4', gpa: 8.3 },
    { sem: 'Sem 5', gpa: 8.45 },
  ],
  quickStats: [
    { label: 'Classmates', value: 42, icon: Users, color: '#0ea5e9', bg: '#e0f2fe' },
    { label: 'Subjects', value: 6, icon: BookOpen, color: '#22c55e', bg: '#dcfce7' },
    { label: 'Assignments', value: 8, icon: FileText, color: '#eab308', bg: '#fef9c3' },
  ],
  upcomingClasses: [
    { subject: 'Data Structures', time: '10:00 AM', room: 'CS-201' },
    { subject: 'Database Systems', time: '11:00 AM', room: 'CS-203' },
    { subject: 'Operating Systems', time: '2:00 PM', room: 'CS-101' },
  ],
  recentMarks: [
    { subject: 'Data Structures', internal: 42, external: 58, total: 100, grade: 'A' },
    { subject: 'Database Systems', internal: 38, external: 52, total: 90, grade: 'A-' },
    { subject: 'Operating Systems', internal: 35, external: 48, total: 83, grade: 'B+' },
  ],
  alerts: [
    { type: 'warning', message: 'Attendance in Operating Systems is below 75%' },
  ],
};

export default function StudentDashboard() {
  const { user } = useAuth();

  return (
    <div className="dash-wrapper">
      <div className="dash-header inst-header">
        <div className="inst-header-main">
          <div>
            <h1>Welcome back, {user?.name?.split(' ')[0] || 'Student'}!</h1>
            <p>Here's an overview of your academic progress</p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {dashboardData.alerts.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          {dashboardData.alerts.map((alert, index) => (
            <div
              key={index}
              style={{ padding: '12px', background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', color: '#92400e' }}
            >
              <AlertTriangle size={20} />
              <span>{alert.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Summary Cards */}
      <div className="dash-cards">
        <div className="dash-card">
          <span className="dash-card-label">Roll Number</span>
          <span className="dash-card-value" style={{ fontSize: '1.2rem' }}>{user?.rollNo || 'N/A'}</span>
          <User size={20} style={{ opacity: 0.5, marginTop: '5px' }} />
        </div>
        <div className="dash-card">
          <span className="dash-card-label">Department</span>
          <span className="dash-card-value" style={{ fontSize: '1.2rem' }}>{user?.department || 'N/A'}</span>
          <Building2 size={20} style={{ opacity: 0.5, marginTop: '5px' }} />
        </div>
        <div className="dash-card">
          <span className="dash-card-label">Year / Semester</span>
          <span className="dash-card-value" style={{ fontSize: '1.2rem' }}>{user?.year || '-'} / {user?.semester || '-'}</span>
          <Calendar size={20} style={{ opacity: 0.5, marginTop: '5px' }} />
        </div>
        <div className="dash-card">
          <span className="dash-card-label">CGPA</span>
          <span className="dash-card-value" style={{ fontSize: '1.2rem' }}>{dashboardData.cgpa.toFixed(2)}</span>
          <GraduationCap size={20} style={{ opacity: 0.5, marginTop: '5px' }} />
        </div>
      </div>

      <div className="dash-bottom">
        {/* Attendance Donut */}
        <section className="dash-panel" style={{ flex: 1 }}>
          <div className="dash-panel-head">
            <h2>Attendance</h2>
            <p>Current Semester Overview</p>
          </div>
          <div className="dash-panel-body">
            <div style={{ height: '240px', width: '100%', display: 'flex', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData.attendanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {dashboardData.attendanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px' }}>
              {dashboardData.attendanceData.map((entry, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: entry.color }} />
                  <span style={{ fontSize: '14px', color: '#666' }}>
                    {entry.name} ({entry.value}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* GPA Trend Chart */}
        <section className="dash-panel" style={{ flex: 1 }}>
          <div className="dash-panel-head">
            <h2>GPA Trend</h2>
            <p>Semester-wise</p>
          </div>
          <div className="dash-panel-body">
            <div style={{ height: '240px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboardData.gpaTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis
                    dataKey="sem"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <YAxis
                    domain={[6, 10]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <ChartTooltip />
                  <Line
                    type="monotone"
                    dataKey="gpa"
                    stroke="#0d9488"
                    strokeWidth={2}
                    dot={{ fill: '#0d9488', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      </div>

      <div className="dash-bottom" style={{ marginTop: '20px' }}>
        {/* Recent Marks */}
        <section className="dash-panel" style={{ flex: 2 }}>
          <div className="dash-panel-head">
            <h2>Recent Marks</h2>
            <p>Latest examination results</p>
          </div>
          <div className="dash-panel-body">
            <div className="table-scroll">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Subject</th>
                    <th style={{ textAlign: 'center' }}>Int</th>
                    <th style={{ textAlign: 'center' }}>Ext</th>
                    <th style={{ textAlign: 'center' }}>Total</th>
                    <th style={{ textAlign: 'center' }}>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.recentMarks.map((mark, index) => (
                    <tr key={index}>
                      <td style={{ fontWeight: 500 }}>{mark.subject}</td>
                      <td style={{ textAlign: 'center' }}>{mark.internal}</td>
                      <td style={{ textAlign: 'center' }}>{mark.external}</td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{mark.total}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          backgroundColor: mark.grade.startsWith('A') ? '#dcfce7' : '#e0f2fe',
                          color: mark.grade.startsWith('A') ? '#166534' : '#075985'
                        }}>
                          {mark.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="dash-panel" style={{ flex: 1 }}>
          <div className="dash-panel-head">
            <h2>Quick Stats</h2>
            <p>Overview of your classroom</p>
          </div>
          <div className="dash-panel-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {dashboardData.quickStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb',
                      background: '#fff'
                    }}
                  >
                    <div style={{
                      padding: '10px',
                      borderRadius: '50%',
                      backgroundColor: stat.bg,
                      color: stat.color,
                      marginBottom: '8px'
                    }}>
                      <Icon size={24} />
                    </div>
                    <span style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>{stat.value}</span>
                    <span style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {stat.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
