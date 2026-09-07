import React from 'react';
import {
  Sparkles,
  Wrench,
  CheckSquare,
  Bug,
  FlaskConical,
  Lightbulb,
  AlertCircle,
  Inbox,
  Calendar,
  PlayCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import {
  WorkItemType,
  Priority,
  Size,
  WorkItemStatus,
  BugSeverity,
} from '../../types';
import {
  WORK_ITEM_TYPE_META,
  PRIORITY_META,
  SIZE_META,
  STATUS_WORKFLOW_META,
  BUG_SEVERITY_META,
} from '../../utils/constants';

interface BadgeProps {
  children?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

export const TypeBadge: React.FC<{ type: WorkItemType; size?: 'sm' | 'md' }> = ({ type, size = 'sm' }) => {
  const meta = WORK_ITEM_TYPE_META[type] || WORK_ITEM_TYPE_META.task;

  const renderIcon = () => {
    const iconSize = size === 'sm' ? 12 : 14;
    switch (type) {
      case 'idea': return <Lightbulb size={iconSize} className="mr-1 text-purple-400" />;
      case 'feature': return <Sparkles size={iconSize} className="mr-1 text-sky-400" />;
      case 'improvement': return <Wrench size={iconSize} className="mr-1 text-amber-400" />;
      case 'task': return <CheckSquare size={iconSize} className="mr-1 text-blue-400" />;
      case 'bug': return <Bug size={iconSize} className="mr-1 text-rose-400" />;
      case 'test': return <FlaskConical size={iconSize} className="mr-1 text-emerald-400" />;
    }
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded border ${meta.bg} ${meta.color} ${meta.border} ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
      }`}
    >
      {renderIcon()}
      {meta.label}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: Priority; showDescription?: boolean; size?: 'sm' | 'md' }> = ({
  priority,
  showDescription = false,
  size = 'sm',
}) => {
  const meta = PRIORITY_META[priority] || PRIORITY_META.P3;
  return (
    <span
      className={`inline-flex items-center font-mono font-semibold rounded border ${meta.bg} ${meta.color} ${meta.border} ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
      }`}
      title={meta.description}
    >
      {priority === 'P0' && <AlertCircle size={12} className="mr-1 animate-pulse text-rose-400" />}
      {showDescription ? meta.label : priority}
    </span>
  );
};

export const SizeBadge: React.FC<{ sizeValue?: Size | null; size?: 'sm' | 'md' }> = ({ sizeValue, size = 'sm' }) => {
  if (!sizeValue) return null;
  const meta = SIZE_META[sizeValue];
  return (
    <span
      className={`inline-flex items-center font-mono font-medium rounded bg-slate-800/80 text-slate-300 border border-slate-700/60 ${
        size === 'sm' ? 'px-1.5 py-0.5 text-[11px]' : 'px-2 py-1 text-xs'
      }`}
      title={meta?.timeEstimate}
    >
      {sizeValue}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: WorkItemStatus; size?: 'sm' | 'md' }> = ({ status, size = 'sm' }) => {
  const meta = STATUS_WORKFLOW_META[status] || STATUS_WORKFLOW_META.backlog;

  const renderIcon = () => {
    const iconSize = size === 'sm' ? 12 : 14;
    switch (status) {
      case 'backlog': return <Inbox size={iconSize} className="mr-1 text-slate-400" />;
      case 'planned': return <Calendar size={iconSize} className="mr-1 text-indigo-400" />;
      case 'in_progress': return <PlayCircle size={iconSize} className="mr-1 text-blue-400" />;
      case 'testing': return <FlaskConical size={iconSize} className="mr-1 text-purple-400" />;
      case 'completed': return <CheckCircle2 size={iconSize} className="mr-1 text-emerald-400" />;
    }
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded border ${meta.bg} ${meta.color} ${meta.border} ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
      }`}
    >
      {renderIcon()}
      {meta.label}
    </span>
  );
};

export const SeverityBadge: React.FC<{ severity?: BugSeverity | null; size?: 'sm' | 'md' }> = ({ severity, size = 'sm' }) => {
  if (!severity) return null;
  const meta = BUG_SEVERITY_META[severity] || BUG_SEVERITY_META.minor;
  return (
    <span
      className={`inline-flex items-center font-semibold rounded border ${meta.bg} ${meta.color} ${meta.border} uppercase tracking-wider ${
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      }`}
    >
      {severity}
    </span>
  );
};

export const BlockedBadge: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'sm' }) => {
  return (
    <span
      className={`inline-flex items-center font-semibold rounded bg-orange-950/70 text-orange-400 border border-orange-600/70 animate-pulse ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
      }`}
    >
      <Lock size={12} className="mr-1" />
      BLOCKED
    </span>
  );
};
