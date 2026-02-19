import { cn } from '@/pages/student/lib/utils';
import { LucideIcon } from 'lucide-react';

interface InfoCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  variant?: 'default' | 'primary' | 'secondary' | 'accent';
  className?: string;
}

export default function InfoCard({ label, value, icon: Icon, variant = 'default', className }: InfoCardProps) {
  const variantClasses = {
    default: 'stat-card',
    primary: 'stat-card stat-card-primary',
    secondary: 'stat-card stat-card-secondary',
    accent: 'stat-card stat-card-accent',
  };

  return (
    <div className={cn(variantClasses[variant], 'animate-fade-in', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className={cn(
            'text-sm font-medium mb-1',
            variant === 'default' ? 'text-muted-foreground' : 'opacity-80'
          )}>
            {label}
          </p>
          <p className="text-2xl font-bold font-display">{value}</p>
        </div>
        {Icon && (
          <div className={cn(
            'p-2 rounded-lg',
            variant === 'default' ? 'bg-primary/10' : 'bg-white/20'
          )}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}

