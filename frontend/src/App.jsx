import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

import CompanyLayout from "./pages/Company_admin/components/CompanyLayout";
import CompanyAdminDashboard from "./pages/Company_admin/Dashboard";
import Institutions from "./pages/Company_admin/Institutions";
import Users from "./pages/Company_admin/Users";
import GlobalReport from "./pages/Company_admin/GlobalReport";

// Institution admin
import InstitutionLayout from "./pages/Institution_admin/InstitutionLayout";
import InstitutionDashboard from "./pages/Institution_admin/Dashboard";
import InstitutionBranches from "./pages/Institution_admin/Branches";
// TODO: create these files/components:
import BranchAdmins from "./pages/Institution_admin/Branches";
import InstitutionReports from "./pages/Institution_admin/Reports";
import ChangePassword from "./pages/Institution_admin/ChangePassword";

// Other roles
import BranchAdminDashboard from "./pages/Branch_admin/Dashboard";
import StaffDashboard from "./pages/Staff/Dashboard";
import ParentDashboard from "./pages/Parent/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<Login />} />
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

        {/* Other roles */}
        <Route
          path="/branch-admin/dashboard"
          element={<BranchAdminDashboard />}
        />
        <Route path="/staff/dashboard" element={<StaffDashboard />} />
        <Route path="/parent/dashboard" element={<ParentDashboard />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
