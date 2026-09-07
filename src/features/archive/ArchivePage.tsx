import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { workItemService, versionService } from '../../services/dbStore';
import { WorkItem, Version } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { WorkItemCard } from '../../components/workItems/WorkItemCard';
import { WorkItemModal } from '../workItems/WorkItemModal';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDate } from '../../utils/dateUtils';
import { Archive, RotateCcw, CheckCircle2, Trash2, Calendar, FileText } from 'lucide-react';

export const ArchivePage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { projects, activeProject } = useProject();
  const { user } = useAuth();

  const isProjectScoped = Boolean(projectId);
  const currentProjId = projectId || activeProject?.id;

  const [activeTab, setActiveTab] = useState<'completed' | 'deleted'>('completed');
  const [items, setItems] = useState<WorkItem[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);
  const [selectedItem, setSelectedItem] = useState<WorkItem | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadArchiveData = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      let loadedItems: WorkItem[] = [];
      let loadedVersions: Version[] = [];

      if (isProjectScoped && currentProjId) {
        loadedItems = await workItemService.getWorkItems(currentProjId);
        loadedVersions = await versionService.getVersions(currentProjId);
      } else {
        loadedItems = await workItemService.getAllUserWorkItems(user.uid);
        const vPromises = projects.map(p => versionService.getVersions(p.id));
        const vArrays = await Promise.all(vPromises);
        loadedVersions = vArrays.flat();
      }

      setItems(loadedItems);
      setVersions(loadedVersions);
    } catch (err) {
      console.error('Failed to load archive data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadArchiveData();
  }, [user, currentProjId, isProjectScoped]);

  const completedItems = items.filter(i => i.status === 'completed' && !i.isDeleted);
  const deletedItems = items.filter(i => i.isDeleted);

  const handleRestore = async (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await workItemService.restoreWorkItem(itemId);
      loadArchiveData();
    } catch (err) {
      console.error('Failed to restore item:', err);
    }
  };

  const getProjectName = (projId: string) => {
    return projects.find(p => p.id === projId)?.name || 'Project';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Archive size={20} className="text-slate-400" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {isProjectScoped ? 'Project Archive' : 'Global Archive'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Safe repository for completed features and soft-deleted items with restoration support.
          </p>
        </div>
      </div>

      {/* Tabs: Completed Archive vs Deleted Archive */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-medium">
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'completed'
              ? 'bg-slate-800 text-emerald-400 font-semibold border border-emerald-800/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckCircle2 size={14} />
          Completed Archive ({completedItems.length})
        </button>

        <button
          onClick={() => setActiveTab('deleted')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'deleted'
              ? 'bg-slate-800 text-rose-400 font-semibold border border-rose-800/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Trash2 size={14} />
          Deleted Archive ({deletedItems.length})
        </button>
      </div>

      {/* Completed Archive Tab */}
      {activeTab === 'completed' && (
        <div>
          {completedItems.length === 0 ? (
            <EmptyState
              icon={<CheckCircle2 size={28} className="text-emerald-400" />}
              title="No completed items yet"
              description="Items will appear here once they pass testing and approval."
            />
          ) : (
            <div className="space-y-2.5">
              {completedItems.map(item => (
                <WorkItemCard
                  key={item.id}
                  item={item}
                  projectName={!isProjectScoped ? getProjectName(item.projectId) : undefined}
                  version={versions.find(v => v.id === item.targetVersionId)}
                  onClick={() => {
                    setSelectedItem(item);
                    setIsItemModalOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Deleted Archive Tab (Soft-deleted with reason and restore) */}
      {activeTab === 'deleted' && (
        <div>
          {deletedItems.length === 0 ? (
            <EmptyState
              icon={<Trash2 size={28} className="text-slate-400" />}
              title="Deleted Archive is empty"
              description="Deleted work items are placed here for safe keeping and can be restored anytime."
            />
          ) : (
            <div className="space-y-3">
              {deletedItems.map(item => (
                <Card
                  key={item.id}
                  className="p-4 bg-[#111827] border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-rose-950/60 text-rose-400 border border-rose-800/40 font-semibold">
                        Deleted
                      </span>
                      {!isProjectScoped && (
                        <span className="text-[10px] font-mono text-slate-400">
                          [{getProjectName(item.projectId)}]
                        </span>
                      )}
                      <h3 className="text-sm font-semibold text-slate-200 line-through opacity-80">
                        {item.title}
                      </h3>
                    </div>

                    {item.deletionReason && (
                      <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5 mt-1">
                        <FileText size={12} className="text-slate-500" />
                        Reason: {item.deletionReason}
                      </p>
                    )}

                    <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                      <Calendar size={11} /> Deleted on: {formatDate(item.deletedAt)}
                    </span>
                  </div>

                  <Button
                    size="xs"
                    variant="outline"
                    onClick={e => handleRestore(item.id, e)}
                    leftIcon={<RotateCcw size={13} className="text-emerald-400" />}
                    className="shrink-0 text-emerald-300 hover:bg-emerald-950/30 hover:border-emerald-800/50"
                  >
                    Restore Item
                  </Button>
                </Card>
              ))}
            </div>
          )}
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
          allProjectItems={items}
          onItemUpdated={loadArchiveData}
        />
      )}
    </div>
  );
};
