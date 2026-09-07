import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { workItemService, versionService } from '../../services/dbStore';
import { WorkItem, Version } from '../../types';
import { WorkItemCard } from '../../components/workItems/WorkItemCard';
import { WorkItemModal } from '../workItems/WorkItemModal';
import { EmptyState } from '../../components/common/EmptyState';
import { Star, Sparkles } from 'lucide-react';

export const MyFocusPage: React.FC = () => {
  const { projects } = useProject();
  const { user } = useAuth();

  const [focusItems, setFocusItems] = useState<WorkItem[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);
  const [selectedItem, setSelectedItem] = useState<WorkItem | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadFocusItems = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const items = await workItemService.getAllUserWorkItems(user.uid);
      setFocusItems(items.filter(i => i.isFocus && !i.isDeleted && i.status !== 'completed'));

      const vPromises = projects.map(p => versionService.getVersions(p.id));
      const vArrays = await Promise.all(vPromises);
      setVersions(vArrays.flat());
    } catch (err) {
      console.error('Failed to load focus items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFocusItems();
  }, [user, projects]);

  const getProjectName = (projId: string) => {
    return projects.find(p => p.id === projId)?.name || 'Project';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2">
          <Star size={22} className="text-amber-400 fill-amber-400" />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            My Focus Tray
          </h1>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-400 border border-amber-800/60 font-semibold">
            {focusItems.length} active
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Your immediate priority queue across all Hentamo Apps projects. Click star on any work item to pin it here.
        </p>
      </div>

      {focusItems.length === 0 ? (
        <EmptyState
          icon={<Star size={28} className="text-amber-400" />}
          title="No focused items pinned"
          description="Star your highest-priority tasks, features, or bugs from any project to keep them front and center here."
        />
      ) : (
        <div className="space-y-3">
          {focusItems.map((item, index) => (
            <div key={item.id} className="flex items-center gap-3">
              <span className="font-mono text-base font-bold text-amber-400/80 w-6 text-right shrink-0">
                {index + 1}.
              </span>
              <div className="flex-1 min-w-0">
                <WorkItemCard
                  item={item}
                  projectName={getProjectName(item.projectId)}
                  version={versions.find(v => v.id === item.targetVersionId)}
                  onClick={() => {
                    setSelectedItem(item);
                    setIsItemModalOpen(true);
                  }}
                  onToggleFocus={async e => {
                    e.stopPropagation();
                    await workItemService.toggleFocus(item.id);
                    loadFocusItems();
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Item Modal */}
      {isItemModalOpen && (
        <WorkItemModal
          isOpen={isItemModalOpen}
          onClose={() => setIsItemModalOpen(false)}
          itemToEdit={selectedItem}
          availableVersions={versions}
          availableFeatureGroups={[]}
          allProjectItems={focusItems}
          onItemUpdated={loadFocusItems}
        />
      )}
    </div>
  );
};
