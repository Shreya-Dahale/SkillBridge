import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  hint?: string;
  badge?: string;
  trend?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'violet';
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  hint,
  badge,
  variant = 'default',
  onClick,
  className = '',
}) => {
  return (
    <div
      onClick={onClick}
      className={`stat-card stat-card-${variant} ${onClick ? 'stat-card-clickable' : ''} ${className}`}
    >
      <div className="stat-card-header">
        <span className="stat-card-label">{label}</span>
        {icon && <div className="stat-card-icon-wrap">{icon}</div>}
      </div>
      <div className="stat-card-body">
        <span className="stat-card-value">{value}</span>
        {badge && <span className="stat-card-badge">{badge}</span>}
      </div>
      {hint && <p className="stat-card-hint">{hint}</p>}
    </div>
  );
};

export default StatCard;
