import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// authentication
import Login from "./pages/auth/Login";
import AdminLogin from "./pages/auth/AdminLogin";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
// company admin
import CompanyLayout from "./pages/Company_admin/components/CompanyLayout";
import CompanyAdminDashboard from "./pages/Company_admin/Dashboard";
import Institutions from "./pages/Company_admin/Institutions";
import Users from "./pages/Company_admin/Users";
import GlobalReport from "./pages/Company_admin/GlobalReport";
// Institution admin
import InstitutionLayout from "./pages/Institution_admin/InstitutionLayout";
import InstitutionDashboard from "./pages/Institution_admin/Dashboard";
import InstitutionBranches from "./pages/Institution_admin/Branches";
import BranchAdmins from "./pages/Institution_admin/Branches";
import InstitutionReports from "./pages/Institution_admin/Reports";
import ChangePassword from "./pages/Institution_admin/ChangePassword";
// Branch admin
import BranchLayout from "./pages/Branch_admin/BranchLayout";
import BranchDashboard from "./pages/Branch_admin/Dashboard";
import BranchStudents from "./pages/Branch_admin/Students";
import BranchFees from "./pages/Branch_admin/Fees";
import BranchSales from "./pages/Branch_admin/Sales";
import BranchInventory from "./pages/Branch_admin/Inventory";
import BranchExpenses from "./pages/Branch_admin/Expenses";
import BranchBuses from "./pages/Branch_admin/Buses";
import BranchReports from "./pages/Branch_admin/Reports";
import BranchChangePassword from "./pages/Branch_admin/ChangePasswordNew";
import BranchStaffManagement from "./pages/Branch_admin/StaffManagement";
// Other roles
import StaffLayout from "./pages/Staff/StaffLayout";
import StaffDashboard from "./pages/Staff/Dashboard";
import StaffAttendance from "./pages/Staff/Attendance";
import StaffReports from "./pages/Staff/Reports";
import StaffCollectFee from "./pages/Staff/CollectFee";
import StaffChangePassword from "./pages/Staff/ChangePassword";
import ParentLogin from "./pages/Parent/ParentLogin";
import ParentDashboard from "./pages/Parent/Dashboard";

// Student
import StudentLayout from "./pages/student/StudentLayout";
import StudentDashboard from "./pages/student/pages/dashboard/StudentDashboard";
import PersonalInfo from "./pages/student/pages/profile/PersonalInfo";
import ParentInfo from "./pages/student/pages/profile/ParentInfo";
import ReferenceInfo from "./pages/student/pages/profile/ReferenceInfo";
import Photos from "./pages/student/pages/profile/Photos";
import Attendance from "./pages/student/pages/academics/Attendance";
import Marks from "./pages/student/pages/academics/Marks";
import Timetable from "./pages/student/pages/academics/Timetable";
import Leave from "./pages/student/pages/academics/Leave";
import StudentPortfolio from "./pages/student/pages/portfolio/StudentPortfolio";
import Notifications from "./pages/student/pages/notifications/Notifications";
import Announcements from "./pages/student/pages/announcements/Announcements";

// Auth Context
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Company admin module with layout */}
          <Route path="/company-admin" element={<CompanyLayout />}>
            <Route path="dashboard" element={<CompanyAdminDashboard />} />
            <Route path="institutions" element={<Institutions />} />
            <Route path="users" element={<Users />} />
            <Route path="report" element={<GlobalReport />} />
          </Route>

          {/* Institution admin module with layout */}
          <Route path="/institution" element={<InstitutionLayout />}>
            <Route path="dashboard" element={<InstitutionDashboard />} />
            <Route path="branches" element={<InstitutionBranches />} />
            <Route path="branch-admins" element={<BranchAdmins />} />
            <Route path="reports" element={<InstitutionReports />} />
            <Route path="change-password" element={<ChangePassword />} />
          </Route>
          {/* Branch admin module with layout */}
          <Route path="/branch" element={<BranchLayout />}>
            <Route path="dashboard" element={<BranchDashboard />} />
            <Route path="students" element={<BranchStudents />} />
            <Route path="fees" element={<BranchFees />} />
            <Route path="sales" element={<BranchSales />} />
            <Route path="inventory" element={<BranchInventory />} />
            <Route path="expenses" element={<BranchExpenses />} />
            <Route path="buses" element={<BranchBuses />} />
            <Route path="staff-management" element={<BranchStaffManagement />} />
            <Route path="change-password" element={<BranchChangePassword />} />
            <Route path="reports" element={<BranchReports />} />
          </Route>
          {/* Staff module with layout */}
          <Route path="/staff" element={<StaffLayout />}>
            <Route path="dashboard" element={<StaffDashboard />} />
            <Route path="attendance" element={<StaffAttendance />} />
            <Route path="reports" element={<StaffReports />} />
            <Route path="collect-fee" element={<StaffCollectFee />} />
            <Route path="change-password" element={<StaffChangePassword />} />
          </Route>

          {/* Student */}
          <Route path="/student" element={<StudentLayout />}>
            <Route path="dashboard" element={<StudentDashboard />} />

            {/* Profile */}
            <Route path="profile/personal" element={<PersonalInfo />} />
            <Route path="profile/parent" element={<ParentInfo />} />
            <Route path="profile/reference" element={<ReferenceInfo />} />
            <Route path="profile/photos" element={<Photos />} />

            {/* Academics */}
            <Route path="academics/attendance" element={<Attendance />} />
            <Route path="academics/marks" element={<Marks />} />
            <Route path="academics/timetable" element={<Timetable />} />
            <Route path="academics/leave" element={<Leave />} />

            {/* Portfolio */}
            <Route path="portfolio/sports" element={<StudentPortfolio />} />
            <Route path="portfolio/events" element={<StudentPortfolio />} />
            <Route path="portfolio/certifications" element={<StudentPortfolio />} />
            <Route path="portfolio/projects" element={<StudentPortfolio />} />

            {/* Others */}
            <Route path="notifications" element={<Notifications />} />
            <Route path="announcements" element={<Announcements />} />
          </Route>

          {/* Parent */}
          <Route path="/parent/login" element={<ParentLogin />} />
          <Route path="/parent/dashboard" element={<ParentDashboard />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
