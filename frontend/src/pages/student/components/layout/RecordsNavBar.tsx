import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/pages/student/lib/utils';

interface RecordsNavItem {
  path: string;
  label: string;
}

const recordsNavItems: RecordsNavItem[] = [
  { path: '/student/records/certifications', label: 'Certifications' },
];

export default function RecordsNavBar() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="mb-6">
      <nav className="flex flex-wrap gap-2 border-b border-border">
        {recordsNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={cn(
              'px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px',
              isActive(item.path)
                ? 'text-primary border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            )}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

