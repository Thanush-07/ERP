import { cn } from '@/pages/student/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  status?: 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  className?: string;
}

export default function ProgressBar({ 
  value, 
  max = 100, 
  status = 'success', 
  showLabel = true,
  className 
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const statusClasses = {
    success: 'progress-success',
    warning: 'progress-warning',
    danger: 'progress-danger',
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="progress-bar flex-1">
        <div 
          className={cn('progress-fill', statusClasses[status])}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-sm font-medium min-w-[3rem] text-right">
          {percentage.toFixed(1)}%
        </span>
      )}
    </div>
  );
}

