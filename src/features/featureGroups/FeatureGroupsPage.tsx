import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProject } from '../../context/ProjectContext';
import { featureGroupService, workItemService, versionService } from '../../services/dbStore';
import { FeatureGroup, WorkItem, Version } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { WorkItemCard } from '../../components/workItems/WorkItemCard';
import { FeatureGroupModal } from './FeatureGroupModal';
import { WorkItemModal } from '../workItems/WorkItemModal';
import { Layers, Plus, Edit2 } from 'lucide-react';

export const FeatureGroupsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { activeProject } = useProject();
  const currentProjId = projectId || activeProject?.id;

  const [groups, setGroups] = useState<FeatureGroup[]>([]);
  const [items, setItems] = useState<WorkItem[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);
  const [selectedGroupForEdit, setSelectedGroupForEdit] = useState<FeatureGroup | null>(null);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WorkItem | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    if (!currentProjId) return;
    try {
      setIsLoading(true);
      const [groupsData, itemsData, versionsData] = await Promise.all([
        featureGroupService.getFeatureGroups(currentProjId),
        workItemService.getWorkItems(currentProjId),
        versionService.getVersions(currentProjId),
      ]);
      setGroups(groupsData);
      setItems(itemsData.filter(i => !i.isDeleted));
      setVersions(versionsData);
    } catch (err) {
      console.error('Failed to load feature groups:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentProjId]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Layers size={20} className="text-sky-400" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Feature Groups
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
              {groups.length} groups
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Higher-level thematic domains (e.g. Championship System, Statistics, Wallet) independent of releases.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={() => {
            setSelectedGroupForEdit(null);
            setIsGroupModalOpen(true);
          }}
          leftIcon={<Plus size={14} />}
        >
          Create Feature Group
        </Button>
      </div>

      {/* Groups List */}
      {groups.length === 0 ? (
        <EmptyState
          icon={<Layers size={28} className="text-sky-400" />}
          title="No feature groups created yet."
          description="Group your features and tasks thematically across multiple versions."
          actionText="Create Feature Group"
          onAction={() => {
            setSelectedGroupForEdit(null);
            setIsGroupModalOpen(true);
          }}
        />
      ) : (
        <div className="space-y-6">
          {groups.map(group => {
            const groupItems = items.filter(i => i.featureGroupId === group.id);
            const completedCount = groupItems.filter(i => i.status === 'completed').length;

            return (
              <div
                key={group.id}
                className="p-5 rounded-2xl bg-[#111827] border border-slate-800 space-y-4"
              >
                {/* Group Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-sm"
                      style={{ backgroundColor: group.color || '#38BDF8' }}
                    />
                    <div>
                      <h3 className="text-base font-bold text-white">
                        {group.name}
                      </h3>
                      {group.description && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          {group.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-400">
                      {completedCount}/{groupItems.length} Completed
                    </span>
                    <button
                      onClick={() => {
                        setSelectedGroupForEdit(group);
                        setIsGroupModalOpen(true);
                      }}
                      className="p-1 rounded text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Edit Group"
                    >
                      <Edit2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Items in this group */}
                {groupItems.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2 pl-2">
                    No work items assigned to this feature group yet.
                  </p>
                ) : (
                  <div className="space-y-2 pt-1 border-t border-slate-800/80">
                    {groupItems.map(item => (
                      <WorkItemCard
                        key={item.id}
                        item={item}
                        version={versions.find(v => v.id === item.targetVersionId)}
                        onClick={() => {
                          setSelectedItem(item);
                          setIsItemModalOpen(true);
                        }}
                        onToggleFocus={async e => {
                          e.stopPropagation();
                          await workItemService.toggleFocus(item.id);
                          loadData();
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Feature Group Modal */}
      {currentProjId && (
        <FeatureGroupModal
          isOpen={isGroupModalOpen}
          onClose={() => setIsGroupModalOpen(false)}
          projectId={currentProjId}
          groupToEdit={selectedGroupForEdit}
          onSaved={loadData}
        />
      )}

      {/* Item Modal */}
      {isItemModalOpen && (
        <WorkItemModal
          isOpen={isItemModalOpen}
          onClose={() => setIsItemModalOpen(false)}
          itemToEdit={selectedItem}
          defaultProjectId={currentProjId}
          availableVersions={versions}
          availableFeatureGroups={groups}
          allProjectItems={items}
          onItemUpdated={loadData}
        />
      )}
    </div>
  );
};
