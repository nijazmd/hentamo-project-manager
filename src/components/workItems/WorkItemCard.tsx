import React from 'react';
import {
  TypeBadge,
  PriorityBadge,
  SizeBadge,
  StatusBadge,
  SeverityBadge,
  BlockedBadge,
} from '../common/Badge';
import { WorkItem, Version } from '../../types';
import { Card } from '../common/Card';
import { Star, CheckSquare, Calendar, Milestone, AlertTriangle, Paperclip } from 'lucide-react';
import { formatDate, isOverdue } from '../../utils/dateUtils';

interface WorkItemCardProps {
  item: WorkItem;
  version?: Version | null;
  projectName?: string;
  onClick: () => void;
  onToggleFocus?: (e: React.MouseEvent) => void;
}

export const WorkItemCard: React.FC<WorkItemCardProps> = ({
  item,
  version,
  projectName,
  onClick,
  onToggleFocus,
}) => {
  const completedSubtasks = (item.subtasks || []).filter(s => s.isCompleted).length;
  const totalSubtasks = (item.subtasks || []).length;
  const isItemBlocked = (item.dependencies || []).some(d => d.type === 'is_blocked_by');
  const overdue = isOverdue(item.dueDate);

  return (
    <Card
      hoverable
      onClick={onClick}
      className={`p-3.5 sm:p-4 transition-all relative group border-slate-800/90 ${
        item.isFocus ? 'border-amber-500/40 bg-[#121927]' : ''
      }`}
    >
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {projectName && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-sky-400 font-semibold border border-slate-700/60">
              {projectName}
            </span>
          )}
          <TypeBadge type={item.type} />
          <PriorityBadge priority={item.priority} />
          {item.size && <SizeBadge sizeValue={item.size} />}
          {item.type === 'bug' && item.bugSeverity && (
            <SeverityBadge severity={item.bugSeverity} />
          )}
          {isItemBlocked && <BlockedBadge />}
        </div>

        {/* Focus Toggle Star */}
        {onToggleFocus && (
          <button
            onClick={e => {
              e.stopPropagation();
              onToggleFocus(e);
            }}
            className={`p-1 rounded-md transition-colors cursor-pointer ${
              item.isFocus
                ? 'text-amber-400 hover:text-amber-300'
                : 'text-slate-600 hover:text-slate-400 opacity-0 group-hover:opacity-100'
            }`}
            title={item.isFocus ? 'Remove from Focus' : 'Add to My Focus'}
          >
            <Star
              size={15}
              className={item.isFocus ? 'fill-amber-400 text-amber-400' : ''}
            />
          </button>
        )}
      </div>

      {/* Item Title */}
      <h3 className="text-sm font-medium text-slate-100 group-hover:text-sky-300 transition-colors line-clamp-2 mb-2 leading-snug">
        {item.title}
      </h3>

      {/* Footer Info Row */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60 mt-auto flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={item.status} />

          {/* Version badge */}
          {version ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-indigo-300 bg-indigo-950/40 px-1.5 py-0.5 rounded border border-indigo-800/40">
              <Milestone size={11} />
              v{version.versionNumber}
            </span>
          ) : (
            <span className="text-[11px] font-mono text-slate-500">
              Backlog
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5 text-slate-500">
          {/* Subtask count */}
          {totalSubtasks > 0 && (
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-mono ${
                completedSubtasks === totalSubtasks
                  ? 'text-emerald-400 font-semibold'
                  : 'text-slate-400'
              }`}
            >
              <CheckSquare size={12} />
              {completedSubtasks}/{totalSubtasks}
            </span>
          )}

          {/* Attachments */}
          {(item.attachments || []).length > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
              <Paperclip size={12} />
              {item.attachments.length}
            </span>
          )}

          {/* Due date */}
          {item.dueDate && (
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-mono ${
                overdue && item.status !== 'completed'
                  ? 'text-rose-400 font-semibold'
                  : 'text-slate-400'
              }`}
            >
              <Calendar size={11} />
              {formatDate(item.dueDate)}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};
