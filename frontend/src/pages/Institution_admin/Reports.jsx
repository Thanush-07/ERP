import { useEffect, useState } from "react";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";
import "./styles/Reports.css";

const API_BASE = "http://localhost:5000/api/institution";
const BRANCH_API = "http://localhost:5000/api/branch";

export default function InstitutionReports() {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [branchStats, setBranchStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const institutionId = user.institutionId || user.institution_id || null;

  const loadBranches = async () => {
    if (!institutionId) return;
    try {
      const res = await axios.get(`${API_BASE}/${institutionId}/branches`);
      setBranches(res.data);
    } catch (err) {
      console.error("LOAD BRANCHES ERROR", err.response?.data || err.message);
    }
  };

  const loadBranchStats = async (branchId) => {
    if (!branchId) {
      setBranchStats(null);
      return;
    }
    setLoading(true);
    try {
      // Fetch data with individual error handling
      let students = [];
      let staff = [];
      let fees = [];
      let expenses = [];
      let inventory = [];

      try {
        const res = await axios.get(`${BRANCH_API}/${branchId}/students`);
        students = res.data || [];
      } catch (err) {
        console.log("Students endpoint not available");
      }

      try {
        const res = await axios.get(`${BRANCH_API}/${branchId}/staff`);
        staff = res.data || [];
      } catch (err) {
        console.log("Staff endpoint not available");
      }

      try {
        const res = await axios.get(`${BRANCH_API}/${branchId}/fees`);
        fees = res.data || [];
      } catch (err) {
        console.log("Fees endpoint not available");
      }

      try {
        const res = await axios.get(`${BRANCH_API}/${branchId}/expenses`);
        expenses = res.data || [];
      } catch (err) {
        console.log("Expenses endpoint not available");
      }

      // Inventory: try central inventory API, then branch stock report as fallback
      try {
        const res = await axios.get(`http://localhost:5000/api/inventory/items`, { params: { branchId } });
        inventory = Array.isArray(res.data) ? res.data : [];
      } catch (err1) {
        try {
          const res2 = await axios.get(`${BRANCH_API}/${branchId}/reports/stock`);
          const stock = res2?.data?.stock || res2?.data || [];
          inventory = Array.isArray(stock) ? stock : [];
        } catch (err2) {
          console.log("Inventory endpoints not available");
          inventory = [];
        }
      }

      const teachingStaff = staff.filter(s => {
        const cat = String(s.category || s.staffCategory || "").toLowerCase();
        return cat.includes("teach");
      }).length;
      const nonTeachingStaff = staff.filter(s => {
        const cat = String(s.category || s.staffCategory || "").toLowerCase();
        return !cat.includes("teach");
      }).length;
      const feeCollected = fees.filter(f => f.status === "approved" || f.status === "").reduce((sum, f) => sum + (f.amount || 0), 0);
      const feePending = fees.filter(f => f.status === "pending").reduce((sum, f) => sum + (f.amount || 0), 0);
      const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

      // Normalize inventory data shape for CSV report
      const inventoryData = inventory.map(item => ({
        itemName: item.itemName || item.name || "",
        category: item.category || "",
        quantity: item.quantity !== undefined ? item.quantity : (item.currentStock || 0),
        unitPrice: item.unitPrice || 0,
        updatedAt: item.updatedAt || ""
      }));

      setBranchStats({
        students: students.length,
        teachingStaff,
        nonTeachingStaff,
        totalStaff: staff.length,
        feeCollected,
        feePending,
        totalExpenses,
        inventoryItems: inventoryData.length,
        studentsData: students,
        staffData: staff,
        feesData: fees,
        expensesData: expenses,
        inventoryData
      });
    } catch (err) {
      console.error("LOAD BRANCH STATS ERROR", err);
      setBranchStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-in-out",
      once: true,
      offset: 100
    });
    loadBranches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [institutionId]);

  const handleBranchChange = (e) => {
    const value = e.target.value;
    setSelectedBranch(value);
    if (value) {
      loadBranchStats(value);
    } else {
      setBranchStats(null);
    }
  };

  const generateReport = async (reportType) => {
    if (!selectedBranch) {
      alert("Please select a branch first!");
      return;
    }
    setReportLoading(true);
    try {
      // Generate and download report based on type
      console.log(`Generating ${reportType} report for branch:`, selectedBranch);
      
      let reportData = {};
      const selectedBranchData = branches.find(b => b._id === selectedBranch);
      
      switch(reportType) {
        case "student_list":
          reportData = {
            title: "Student List Report",
            branch: selectedBranchData?.branch_name,
            data: branchStats?.studentsData || []
          };
          downloadStudentListReport(reportData);
          break;
        case "fee_collected":
          reportData = {
            title: "Fee Collected Report",
            branch: selectedBranchData?.branch_name,
            data: branchStats?.feesData.filter(f => f.status === "approved" || f.status === "") || []
          };
          downloadFeeReport(reportData, "collected");
          break;
        case "pending_fee":
          reportData = {
            title: "Pending Fee Report",
            branch: selectedBranchData?.branch_name,
            data: branchStats?.feesData.filter(f => f.status === "pending") || []
          };
          downloadFeeReport(reportData, "pending");
          break;
        case "daily_collection":
          downloadDailyCollectionReport(selectedBranchData?.branch_name, branchStats?.feesData || []);
          break;
        case "billing":
          downloadBillingReport(selectedBranchData?.branch_name, branchStats?.feesData || []);
          break;
        case "stock":
          downloadStockReport(selectedBranchData?.branch_name, branchStats?.inventoryData || []);
          break;
        case "staff_attendance":
          downloadStaffAttendanceReport(selectedBranchData?.branch_name, branchStats?.staffData || []);
          break;
        case "expense":
          downloadExpenseReport(selectedBranchData?.branch_name, branchStats?.expensesData || []);
          break;
        case "bus_transport":
          downloadBusTransportReport(selectedBranchData?.branch_name);
          break;
        default:
          alert("Report type not implemented yet");
      }
    } catch (err) {
      console.error("GENERATE REPORT ERROR", err);
      alert("Failed to generate report");
    } finally {
      setReportLoading(false);
    }
  };

  const downloadStudentListReport = (data) => {
    let csv = "Student ID,Name,Class,Section,Roll Number,Gender,DOB,Parent Name,Contact\n";
    data.data.forEach(student => {
      csv += `${student.studentId || ""},${student.name},${student.class},${student.section},${student.rollNumber || ""},${student.gender || ""},${student.dob || ""},${student.parentName || ""},${student.parentContact || ""}\n`;
    });
    downloadCSV(csv, `${data.branch}_Student_List.csv`);
  };

  const downloadFeeReport = (data, type) => {
    let csv = "Student Name,Class,Section,Amount,Payment Date,Payment Mode,Status\n";
    data.data.forEach(fee => {
      csv += `${fee.studentName || ""},${fee.class || ""},${fee.section || ""},${fee.amount || 0},${fee.paymentDate || ""},${fee.paymentMode || ""},${fee.status || ""}\n`;
    });
    downloadCSV(csv, `${data.branch}_Fee_${type}.csv`);
  };

  const downloadDailyCollectionReport = (branchName, fees) => {
    const dailyData = {};
    fees.filter(f => f.status === "approved" || f.status === "").forEach(fee => {
      const date = fee.paymentDate ? new Date(fee.paymentDate).toLocaleDateString() : "Unknown";
      if (!dailyData[date]) dailyData[date] = { count: 0, total: 0 };
      dailyData[date].count++;
      dailyData[date].total += fee.amount || 0;
    });
    
    let csv = "Date,Transaction Count,Total Amount\n";
    Object.entries(dailyData).forEach(([date, info]) => {
      csv += `${date},${info.count},${info.total}\n`;
    });
    downloadCSV(csv, `${branchName}_Daily_Collection.csv`);
  };

  const downloadBillingReport = (branchName, fees) => {
    let csv = "Invoice No,Student Name,Class,Amount,Date,Status\n";
    fees.forEach((fee, idx) => {
      csv += `INV${String(idx + 1).padStart(5, '0')},${fee.studentName || ""},${fee.class || ""},${fee.amount || 0},${fee.paymentDate || ""},${fee.status || ""}\n`;
    });
    downloadCSV(csv, `${branchName}_Billing_Report.csv`);
  };

  const downloadStockReport = (branchName, inventory) => {
    let csv = "Item Name,Category,Quantity,Unit Price,Total Value,Last Updated\n";
    inventory.forEach(item => {
      const total = (item.quantity || 0) * (item.unitPrice || 0);
      csv += `${item.itemName || ""},${item.category || ""},${item.quantity || 0},${item.unitPrice || 0},${total},${item.updatedAt || ""}\n`;
    });
    downloadCSV(csv, `${branchName}_Stock_Report.csv`);
  };

  const downloadStaffAttendanceReport = (branchName, staff) => {
    let csv = "Staff Name,Category,Position,Contact,Email,Status\n";
    staff.forEach(s => {
      csv += `${s.name || ""},${s.category || ""},${s.position || ""},${s.contact || ""},${s.email || ""},${s.status || "active"}\n`;
    });
    downloadCSV(csv, `${branchName}_Staff_Report.csv`);
  };

  const downloadExpenseReport = (branchName, expenses) => {
    let csv = "Date,Category,Description,Amount,Payment Mode\n";
    expenses.forEach(exp => {
      csv += `${exp.date || ""},${exp.category || ""},${exp.description || ""},${exp.amount || 0},${exp.paymentMode || ""}\n`;
    });
    downloadCSV(csv, `${branchName}_Expense_Report.csv`);
  };

  const downloadBusTransportReport = (branchName) => {
    let csv = "Route,Bus Number,Driver Name,Students Count,Status\n";
    csv += "Sample Route,TN01AB1234,Sample Driver,0,Active\n";
    downloadCSV(csv, `${branchName}_Bus_Transport_Report.csv`);
  };

  const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reportTypes = [
    { id: "student_list", title: "Student List", icon: "👨‍🎓", color: "#3b82f6" },
    { id: "fee_collected", title: "Fee Collected", icon: "💰", color: "#10b981" },
    { id: "pending_fee", title: "Pending Fee", icon: "⏳", color: "#f59e0b" },
    { id: "daily_collection", title: "Daily Collection", icon: "📊", color: "#8b5cf6" },
    { id: "billing", title: "Billing Report", icon: "🧾", color: "#ec4899" },
    { id: "stock", title: "Stock Report", icon: "📦", color: "#06b6d4" },
    { id: "staff_attendance", title: "Staff Report", icon: "👔", color: "#6366f1" },
    { id: "expense", title: "Expense Report", icon: "💸", color: "#ef4444" },
    { id: "bus_transport", title: "Bus Transport", icon: "🚌", color: "#f97316" }
  ];

  return (
    <div className="reports-page">
      <div className="reports-header" data-aos="fade-down">
        <div>
          <h1>Branch Reports</h1>
          <p>Comprehensive reporting for your institution branches</p>
        </div>

        <div className="reports-branch-select">
          <label>Select Branch</label>
          <select value={selectedBranch} onChange={handleBranchChange}>
            <option value="">-- Select a branch --</option>
            {branches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.branch_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!selectedBranch && (
        <div className="reports-empty" data-aos="fade-up">
          <h3>No Branch Selected</h3>
          <p>Please select a branch from the dropdown above to view reports and statistics</p>
        </div>
      )}

      {loading && (
        <div className="reports-loading">
          <div className="spinner"></div>
          <p>Loading branch statistics...</p>
        </div>
      )}

      {selectedBranch && branchStats && !loading && (
        <>
          <div className="reports-stats-grid">
            <div className="reports-stat-card" data-aos="fade-up" data-aos-delay="100" style={{ borderLeftColor: "#3b82f6" }}>
              <div className="reports-stat-content">
                <p>Total Students</p>
                <h3>{branchStats.students}</h3>
              </div>
            </div>

            <div className="reports-stat-card" data-aos="fade-up" data-aos-delay="200" style={{ borderLeftColor: "#10b981" }}>
              <div className="reports-stat-content">
                <p>Teaching Staff</p>
                <h3>{branchStats.teachingStaff}</h3>
              </div>
            </div>

            <div className="reports-stat-card" data-aos="fade-up" data-aos-delay="300" style={{ borderLeftColor: "#8b5cf6" }}>
              <div className="reports-stat-content">
                <p>Non-Teaching Staff</p>
                <h3>{branchStats.nonTeachingStaff}</h3>
              </div>
            </div>

            <div className="reports-stat-card" data-aos="fade-up" data-aos-delay="400" style={{ borderLeftColor: "#10b981" }}>
              <div className="reports-stat-content">
                <p>Fee Collected</p>
                <h3>₹{branchStats.feeCollected.toLocaleString()}</h3>
              </div>
            </div>

            <div className="reports-stat-card" data-aos="fade-up" data-aos-delay="500" style={{ borderLeftColor: "#f59e0b" }}>
              <div className="reports-stat-content">
                <p>Pending Fees</p>
                <h3>₹{branchStats.feePending.toLocaleString()}</h3>
              </div>
            </div>

            <div className="reports-stat-card" data-aos="fade-up" data-aos-delay="600" style={{ borderLeftColor: "#ef4444" }}>
              <div className="reports-stat-content">
                <p>Total Expenses</p>
                <h3>₹{branchStats.totalExpenses.toLocaleString()}</h3>
              </div>
            </div>
          </div>

          <div className="reports-section" data-aos="fade-up">
            <h2>Generate Reports</h2>
            <p className="reports-section-subtitle">Download detailed reports in CSV format</p>

            <div className="reports-grid">
              {reportTypes.map((report, idx) => (
                <div
                  key={report.id}
                  className="reports-card"
                  data-aos="fade-up"
                  data-aos-delay={idx * 50}
                  style={{ borderTopColor: report.color }}
                >
                  <h3>{report.title}</h3>
                  <button
                    className="reports-btn"
                    style={{ background: report.color }}
                    onClick={() => generateReport(report.id)}
                    disabled={reportLoading}
                  >
                    {reportLoading ? "Generating..." : "Generate Report"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
