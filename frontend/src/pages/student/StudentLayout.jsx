import { Outlet } from "react-router-dom";
import { useState } from "react";
import "./student.css";
import Sidebar from "./components/layout/Sidebar";
import Navbar from "./components/layout/Navbar";
import { cn } from "./lib/utils";
import { motion } from "framer-motion";

export default function StudentLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="student-portal min-h-screen bg-background flex">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div
        className={cn(
          "flex-1 transition-all duration-300 ease-in-out",
          isSidebarCollapsed ? "ml-20" : "ml-[280px]"
        )}
      >
        <Navbar />

        <motion.main
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-6 lg:p-8 max-w-7xl mx-auto"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}
