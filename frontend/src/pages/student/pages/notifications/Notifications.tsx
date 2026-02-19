import { useMemo, useState } from "react";
import PageHeader from "@/pages/student/components/layout/PageHeader";
import SectionCard from "@/pages/student/components/common/SectionCard";
import Badge from "@/pages/student/components/common/Badge";
import { Bell, CheckCheck, Trash2 } from "lucide-react";

type NotificationType = "info" | "warning" | "success";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string; // ISO
  type: NotificationType;
  isRead: boolean;
}

const initialNotifications: NotificationItem[] = [
  {
    id: "n1",
    title: "Attendance reminder",
    message: "Your attendance for Data Structures is below 75%. Please improve to avoid shortage.",
    date: "2024-03-01",
    type: "warning",
    isRead: false,
  },
  {
    id: "n2",
    title: "Marks published",
    message: "Semester 5 internal marks have been published. Check the Marks page for details.",
    date: "2024-03-05",
    type: "info",
    isRead: false,
  },
  {
    id: "n3",
    title: "Profile update",
    message: "Your personal information was updated successfully.",
    date: "2024-03-10",
    type: "success",
    isRead: true,
  },
];

function getVariant(type: NotificationType): "info" | "warning" | "success" {
  return type;
}

export default function Notifications() {
  const [items, setItems] = useState<NotificationItem[]>(initialNotifications);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const unreadCount = useMemo(() => items.filter((n) => !n.isRead).length, [items]);

  const filtered = useMemo(() => {
    if (filter === "unread") return items.filter((n) => !n.isRead);
    if (filter === "read") return items.filter((n) => n.isRead);
    return items;
  }, [items, filter]);

  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
  const clearAll = () => setItems([]);
  const toggleRead = (id: string) =>
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n)));

  return (
    <div className="animate-fade-in max-w-5xl">
      <PageHeader
        title="Notifications"
        subtitle="Manage and review your notifications"
        breadcrumbs={[
          { label: "Dashboard", path: "/student/dashboard" },
          { label: "Notifications" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="input-field py-2 pr-8"
              aria-label="Filter notifications"
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
            <button onClick={markAllRead} className="btn-secondary flex items-center gap-2">
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </button>
            <button onClick={clearAll} className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          </div>
        }
      />

      <SectionCard
        title="Inbox"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
      >
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
            No notifications to show.
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {filtered.map((n) => (
              <div key={n.id} className="py-4 flex gap-4 items-start">
                <div className={`mt-1 w-2 h-2 rounded-full ${n.isRead ? "bg-muted-foreground/30" : "bg-primary"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`font-semibold ${n.isRead ? "text-muted-foreground" : ""}`}>{n.title}</p>
                        <Badge variant={getVariant(n.type)}>{n.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-muted-foreground">{n.date}</p>
                      <button
                        onClick={() => toggleRead(n.id)}
                        className="mt-2 text-xs px-3 py-1 rounded-md border border-border hover:bg-muted transition-colors"
                      >
                        {n.isRead ? "Mark unread" : "Mark read"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}



