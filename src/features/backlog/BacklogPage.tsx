import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProject } from '../../context/ProjectContext';
import { workItemService, versionService, featureGroupService } from '../../services/dbStore';
import { WorkItem, Version, FeatureGroup, WorkItemType, Priority, Size } from '../../types';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { WorkItemCard } from '../../components/workItems/WorkItemCard';
import { WorkItemModal } from '../workItems/WorkItemModal';
import { EmptyState } from '../../components/common/EmptyState';
import { Select } from '../../components/common/Input';
import {
  Inbox,
  Plus,
  Search,
  ArrowRight,
  Filter,
  CheckSquare,
  Milestone,
} from 'lucide-react';

export const BacklogPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { activeProject } = useProject();
  const currentProjId = projectId || activeProject?.id;

  const [items, setItems] = useState<WorkItem[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);
  const [featureGroups, setFeatureGroups] = useState<FeatureGroup[]>([]);
  const [selectedItem, setSelectedItem] = useState<WorkItem | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | WorkItemType>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Priority>('all');
  const [sizeFilter, setSizeFilter] = useState<'all' | Size>('all');
  const [groupFilter, setGroupFilter] = useState<'all' | string>('all');

  // Bulk / Selection for moving to version
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [targetVersionToMove, setTargetVersionToMove] = useState('');

  const loadBacklog = async () => {
    if (!currentProjId) return;
    try {
      setIsLoading(true);
      const [itemsData, versionsData, groupsData] = await Promise.all([
        workItemService.getWorkItems(currentProjId),
        versionService.getVersions(currentProjId),
        featureGroupService.getFeatureGroups(currentProjId),
      ]);
      // Backlog contains items where targetVersionId is null or item is unassigned and not deleted
      const backlogItems = itemsData.filter(
        i => !i.targetVersionId && !i.isDeleted && i.status !== 'completed'
      );
      setItems(backlogItems);
      setVersions(versionsData.filter(v => v.status !== 'archived'));
      setFeatureGroups(groupsData);
    } catch (err) {
      console.error('Failed to load backlog:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBacklog();
  }, [currentProjId]);

  // Filtering & Sorting
  const filteredItems = items.filter(item => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }
    if (typeFilter !== 'all' && item.type !== typeFilter) return false;
    if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false;
    if (sizeFilter !== 'all' && item.size !== sizeFilter) return false;
    if (groupFilter !== 'all' && item.featureGroupId !== groupFilter) return false;
    return true;
  });

  const toggleSelectId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBulkMoveToVersion = async () => {
    if (!targetVersionToMove || selectedIds.length === 0) return;
    try {
      await Promise.all(
        selectedIds.map(id =>
          workItemService.updateWorkItem(id, {
            targetVersionId: targetVersionToMove,
            status: 'planned', // assigning moves to planned
          })
        )
      );
      setSelectedIds([]);
      setTargetVersionToMove('');
      loadBacklog();
    } catch (err) {
      console.error('Failed to move items to version:', err);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Inbox size={20} className="text-sky-400" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Project Backlog
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
              {items.length} items
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Unscheduled features, improvements, bugs, and ideas waiting to be assigned to release versions.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={() => {
            setSelectedItem(null);
            setIsItemModalOpen(true);
          }}
          leftIcon={<Plus size={14} />}
        >
          Create Work Item
        </Button>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search bar */}
          <div className="sm:col-span-5 relative flex items-center">
            <Search size={15} className="absolute left-3 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search backlog by title or description..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#111827] border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Type Filter */}
          <div className="sm:col-span-2">
            <Select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as any)}
              className="text-xs py-1.5"
            >
              <option value="all">All Types</option>
              <option value="idea">💡 Ideas</option>
              <option value="feature">✨ Features</option>
              <option value="improvement">🔧 Improvements</option>
              <option value="task">📋 Tasks</option>
              <option value="bug">🐛 Bugs</option>
              <option value="test">🧪 Tests</option>
            </Select>
          </div>

          {/* Priority Filter */}
          <div className="sm:col-span-2">
            <Select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value as any)}
              className="text-xs py-1.5"
            >
              <option value="all">All Priorities</option>
              <option value="P0">P0 — Critical</option>
              <option value="P1">P1 — High</option>
              <option value="P2">P2 — Medium</option>
              <option value="P3">P3 — Low</option>
            </Select>
          </div>

          {/* Feature Group Filter */}
          <div className="sm:col-span-3">
            <Select
              value={groupFilter}
              onChange={e => setGroupFilter(e.target.value)}
              className="text-xs py-1.5"
            >
              <option value="all">All Groups</option>
              {featureGroups.map(fg => (
                <option key={fg.id} value={fg.id}>
                  {fg.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Move to Version Toolbar (When items selected) */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-sky-950/40 border border-sky-800/60 animate-in fade-in">
            <div className="flex items-center gap-2 text-xs text-sky-300 font-medium">
              <CheckSquare size={15} />
              <span>{selectedIds.length} item(s) selected</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-48">
                <Select
                  value={targetVersionToMove}
                  onChange={e => setTargetVersionToMove(e.target.value)}
                  className="text-xs py-1"
                >
                  <option value="">Move to Version...</option>
                  {versions.map(v => (
                    <option key={v.id} value={v.id}>
                      v{v.versionNumber} ({v.title})
                    </option>
                  ))}
                </Select>
              </div>

              <Button
                size="xs"
                variant="primary"
                disabled={!targetVersionToMove}
                onClick={handleBulkMoveToVersion}
                rightIcon={<ArrowRight size={12} />}
              >
                Assign
              </Button>

              <Button
                size="xs"
                variant="ghost"
                onClick={() => setSelectedIds([])}
              >
                Deselect
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Backlog Item List */}
      {filteredItems.length === 0 ? (
        <EmptyState
          icon={<Inbox size={28} className="text-slate-400" />}
          title="No items in the backlog yet."
          description="The backlog keeps track of unscheduled ideas, features, and tasks."
          actionText="Create Work Item"
          onAction={() => {
            setSelectedItem(null);
            setIsItemModalOpen(true);
          }}
        />
      ) : (
        <div className="space-y-2.5">
          {filteredItems.map(item => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <div key={item.id} className="flex items-center gap-2.5">
                {/* Selection Checkbox */}
                <button
                  type="button"
                  onClick={e => toggleSelectId(item.id, e)}
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-sky-500 border-sky-500 text-white'
                      : 'border-slate-700 hover:border-slate-500 bg-[#111827]'
                  }`}
                  title="Select for version assignment"
                >
                  {isSelected && <CheckSquare size={12} />}
                </button>

                <div className="flex-1 min-w-0">
                  <WorkItemCard
                    item={item}
                    onClick={() => {
                      setSelectedItem(item);
                      setIsItemModalOpen(true);
                    }}
                    onToggleFocus={async e => {
                      e.stopPropagation();
                      await workItemService.toggleFocus(item.id);
                      loadBacklog();
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isItemModalOpen && (
        <WorkItemModal
          isOpen={isItemModalOpen}
          onClose={() => setIsItemModalOpen(false)}
          itemToEdit={selectedItem}
          defaultProjectId={currentProjId}
          defaultVersionId={null} // Backlog default
          availableVersions={versions}
          availableFeatureGroups={featureGroups}
          allProjectItems={items}
          onItemUpdated={loadBacklog}
        />
      )}
    </div>
  );
};
