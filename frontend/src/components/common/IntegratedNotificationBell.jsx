import { Bell } from 'lucide-react';
import { useState } from 'react';

export function IntegratedNotificationBell() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <Bell className="w-5 h-5" />
        <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-lg p-4 z-50">
          <h3 className="font-semibold text-foreground mb-2">Notifications</h3>
          <div className="text-sm text-muted-foreground">
            No new notifications
          </div>
        </div>
      )}
    </div>
  );
}
