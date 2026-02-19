import { useAuth } from '@/contexts/AuthContext';
import { Bell, Search, Calendar, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user } = useAuth();
  const [notifications] = useState(3);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="input-field pl-10 py-2"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Date and Time */}
        <div className="hidden md:flex flex-col items-end">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Calendar className="w-4 h-4 text-primary" />
            {formatDate(currentTime)}
          </div>
          <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
            <Clock className="w-3.5 h-3.5 text-secondary" />
            {formatTime(currentTime)}
          </div>
        </div>

        <div className="h-8 w-[1px] bg-border mx-2" />

        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg hover:bg-muted transition-colors"
          onClick={() => navigate('/student/notifications')}
          aria-label="Open notifications"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
          {notifications > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
              {notifications}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

