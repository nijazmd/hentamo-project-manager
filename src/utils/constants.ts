import { WorkItemType, Priority, Size, WorkItemStatus, BugSeverity, VersionStatus, ProjectStatus } from '../types';

export const WORK_ITEM_TYPE_META: Record<WorkItemType, { label: string; icon: string; color: string; bg: string; border: string }> = {
  idea: {
    label: 'Idea',
    icon: 'Lightbulb',
    color: 'text-purple-400',
    bg: 'bg-purple-950/40',
    border: 'border-purple-800/40',
  },
  feature: {
    label: 'Feature',
    icon: 'Sparkles',
    color: 'text-sky-400',
    bg: 'bg-sky-950/40',
    border: 'border-sky-800/40',
  },
  improvement: {
    label: 'Improvement',
    icon: 'Wrench',
    color: 'text-amber-400',
    bg: 'bg-amber-950/40',
    border: 'border-amber-800/40',
  },
  task: {
    label: 'Task',
    icon: 'CheckSquare',
    color: 'text-blue-400',
    bg: 'bg-blue-950/40',
    border: 'border-blue-800/40',
  },
  bug: {
    label: 'Bug',
    icon: 'Bug',
    color: 'text-rose-400',
    bg: 'bg-rose-950/40',
    border: 'border-rose-800/40',
  },
  test: {
    label: 'Test',
    icon: 'FlaskConical',
    color: 'text-emerald-400',
    bg: 'bg-emerald-950/40',
    border: 'border-emerald-800/40',
  },
};

export const PRIORITY_META: Record<Priority, { label: string; description: string; color: string; bg: string; border: string }> = {
  P0: {
    label: 'P0 — Critical',
    description: 'Fix immediately / blocks release',
    color: 'text-rose-400',
    bg: 'bg-rose-950/50',
    border: 'border-rose-700/50',
  },
  P1: {
    label: 'P1 — High',
    description: 'Urgent priority',
    color: 'text-amber-400',
    bg: 'bg-amber-950/50',
    border: 'border-amber-700/50',
  },
  P2: {
    label: 'P2 — Medium',
    description: 'Standard priority',
    color: 'text-blue-400',
    bg: 'bg-blue-950/50',
    border: 'border-blue-700/50',
  },
  P3: {
    label: 'P3 — Low',
    description: 'Minor / nice to have',
    color: 'text-slate-400',
    bg: 'bg-slate-900/60',
    border: 'border-slate-800',
  },
};

export const SIZE_META: Record<Size, { label: string; timeEstimate: string }> = {
  XXS: { label: 'XXS', timeEstimate: 'Few minutes' },
  XS: { label: 'XS', timeEstimate: '< 1 hour' },
  S: { label: 'S', timeEstimate: 'Few hours' },
  M: { label: 'M', timeEstimate: '~1 day' },
  L: { label: 'L', timeEstimate: '2-3 days' },
  XL: { label: 'XL', timeEstimate: 'Up to 1 week' },
  XXL: { label: 'XXL', timeEstimate: 'Large / Complex' },
};

export const STATUS_WORKFLOW_META: Record<WorkItemStatus, { label: string; icon: string; color: string; bg: string; border: string }> = {
  backlog: {
    label: 'Backlog',
    icon: 'Inbox',
    color: 'text-slate-400',
    bg: 'bg-slate-800/40',
    border: 'border-slate-700/40',
  },
  planned: {
    label: 'Planned',
    icon: 'Calendar',
    color: 'text-indigo-400',
    bg: 'bg-indigo-950/40',
    border: 'border-indigo-800/40',
  },
  in_progress: {
    label: 'In Progress',
    icon: 'PlayCircle',
    color: 'text-blue-400',
    bg: 'bg-blue-950/40',
    border: 'border-blue-800/40',
  },
  testing: {
    label: 'Testing',
    icon: 'FlaskConical',
    color: 'text-purple-400',
    bg: 'bg-purple-950/50',
    border: 'border-purple-700/50',
  },
  completed: {
    label: 'Completed',
    icon: 'CheckCircle2',
    color: 'text-emerald-400',
    bg: 'bg-emerald-950/40',
    border: 'border-emerald-800/40',
  },
};

export const BUG_SEVERITY_META: Record<BugSeverity, { label: string; color: string; bg: string; border: string }> = {
  blocker: {
    label: 'Blocker',
    color: 'text-rose-500 font-bold',
    bg: 'bg-rose-950/70',
    border: 'border-rose-600',
  },
  critical: {
    label: 'Critical',
    color: 'text-rose-400',
    bg: 'bg-rose-950/50',
    border: 'border-rose-700',
  },
  major: {
    label: 'Major',
    color: 'text-amber-400',
    bg: 'bg-amber-950/50',
    border: 'border-amber-700',
  },
  minor: {
    label: 'Minor',
    color: 'text-sky-400',
    bg: 'bg-sky-950/40',
    border: 'border-sky-800',
  },
  trivial: {
    label: 'Trivial',
    color: 'text-slate-400',
    bg: 'bg-slate-900',
    border: 'border-slate-800',
  },
};

export const VERSION_STATUS_META: Record<VersionStatus, { label: string; color: string; bg: string }> = {
  planning: { label: 'Planning', color: 'text-indigo-400', bg: 'bg-indigo-950/50' },
  development: { label: 'Development', color: 'text-blue-400', bg: 'bg-blue-950/50' },
  testing: { label: 'Testing', color: 'text-purple-400', bg: 'bg-purple-950/50' },
  released: { label: 'Released', color: 'text-emerald-400', bg: 'bg-emerald-950/50' },
  archived: { label: 'Archived', color: 'text-slate-400', bg: 'bg-slate-900' },
};

export const PROJECT_STATUS_META: Record<ProjectStatus, { label: string; color: string; bg: string }> = {
  active: { label: 'Active', color: 'text-emerald-400', bg: 'bg-emerald-950/40' },
  on_hold: { label: 'On Hold', color: 'text-amber-400', bg: 'bg-amber-950/40' },
  completed: { label: 'Completed', color: 'text-blue-400', bg: 'bg-blue-950/40' },
  archived: { label: 'Archived', color: 'text-slate-400', bg: 'bg-slate-900' },
};
