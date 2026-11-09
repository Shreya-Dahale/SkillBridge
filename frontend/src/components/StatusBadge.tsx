import React from 'react';
import { ShieldCheck, CheckCircle, Clock, AlertCircle, Sparkles } from './Icons';

export type BadgeVariant =
  | 'Verified'
  | 'Demonstrated'
  | 'Needs Refresh'
  | 'Developing'
  | 'Not Yet Demonstrated'
  | 'Applied'
  | 'Shortlisted'
  | 'Interviewing'
  | 'Accepted'
  | 'Rejected'
  | 'open'
  | 'closed'
  | 'draft'
  | 'active'
  | 'pending'
  | 'default';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  const norm = status?.trim() || 'default';

  let variantClass = 'badge-slate';
  let icon: React.ReactNode = null;

  switch (norm.toLowerCase()) {
    case 'verified':
      variantClass = 'badge-verified';
      icon = <ShieldCheck className="w-3.5 h-3.5" />;
      break;
    case 'demonstrated':
      variantClass = 'badge-demonstrated';
      icon = <CheckCircle className="w-3.5 h-3.5" />;
      break;
    case 'needs refresh':
    case 'needs_refresh':
      variantClass = 'badge-refresh';
      icon = <Clock className="w-3.5 h-3.5" />;
      break;
    case 'developing':
      variantClass = 'badge-developing';
      icon = <Sparkles className="w-3.5 h-3.5" />;
      break;
    case 'not yet demonstrated':
    case 'not_yet_demonstrated':
    case 'missing':
      variantClass = 'badge-missing';
      icon = <AlertCircle className="w-3.5 h-3.5" />;
      break;
    case 'shortlisted':
      variantClass = 'badge-shortlisted';
      icon = <Sparkles className="w-3.5 h-3.5" />;
      break;
    case 'interviewing':
      variantClass = 'badge-interviewing';
      icon = <Clock className="w-3.5 h-3.5" />;
      break;
    case 'accepted':
    case 'open':
      variantClass = 'badge-success';
      icon = <CheckCircle className="w-3.5 h-3.5" />;
      break;
    case 'rejected':
    case 'closed':
      variantClass = 'badge-danger';
      icon = <AlertCircle className="w-3.5 h-3.5" />;
      break;
    case 'applied':
    case 'pending':
    case 'draft':
      variantClass = 'badge-pending';
      icon = <Clock className="w-3.5 h-3.5" />;
      break;
    default:
      variantClass = 'badge-slate';
      break;
  }

  const sizeClass = size === 'sm' ? 'badge-sm' : size === 'lg' ? 'badge-lg' : 'badge-md';

  return (
    <span className={`status-badge ${variantClass} ${sizeClass} ${className}`}>
      {showIcon && icon && <span className="badge-icon">{icon}</span>}
      <span className="badge-label">{status}</span>
    </span>
  );
};

export default StatusBadge;
