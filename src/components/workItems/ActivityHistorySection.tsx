import React, { useState, useEffect } from 'react';
import { Activity } from '../../types';
import { History, Activity as ActivityIcon } from 'lucide-react';
import { formatRelativeTime } from '../../utils/dateUtils';
import { activityService } from '../../services/dbStore';

interface ActivityHistorySectionProps {
  workItemId: string;
}

export const ActivityHistorySection: React.FC<ActivityHistorySectionProps> = ({
  workItemId,
}) => {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    let isMounted = true;
    activityService.getActivities(workItemId).then(data => {
      if (isMounted) setActivities(data);
    });
    return () => { isMounted = false; };
  }, [workItemId]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <History size={16} className="text-slate-400" />
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          Activity History
        </h4>
      </div>

      <div className="space-y-2 max-h-52 overflow-y-auto">
        {activities.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-1">
            No activity recorded yet.
          </p>
        ) : (
          activities.map(act => (
            <div
              key={act.id}
              className="flex items-start gap-2.5 text-xs text-slate-300 p-2 rounded-lg bg-[#0B0F17]/60 border border-slate-800/60"
            >
              <div className="w-2 h-2 rounded-full bg-sky-400 mt-1.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="leading-snug text-slate-300">{act.description}</p>
                <span className="text-[10px] font-mono text-slate-500 mt-0.5 block">
                  {formatRelativeTime(act.createdAt)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
