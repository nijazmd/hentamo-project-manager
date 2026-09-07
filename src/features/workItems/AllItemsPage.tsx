import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProject } from '../../context/ProjectContext';
import { workItemService, versionService, featureGroupService } from '../../services/dbStore';
import { WorkItem, Version, FeatureGroup, WorkItemType, WorkItemStatus, Priority, Size } from '../../types';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Input';
import { WorkItemCard } from '../../components/workItems/WorkItemCard';
import { WorkItemModal } from './WorkItemModal';
import { EmptyState } from '../../components/common/EmptyState';
import { ListTodo, Plus, Search, Filter, ArrowUpDown } from 'lucide-react';

export const AllItemsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { activeProject } = useProject();
  const currentProjId = projectId || activeProject?.id;

  const [items, setItems] = useState<WorkItem[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);
  const [featureGroups, setFeatureGroups] = useState<FeatureGroup[]>([]);
  const [selectedItem, setSelectedItem] = useState<WorkItem | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | WorkItemType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | WorkItemStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Priority>('all');
  const [sizeFilter, setSizeFilter] = useState<'all' | Size>('all');
  const [versionFilter, setVersionFilter] = useState<'all' | string>('all');
  const [groupFilter, setGroupFilter] = useState<'all' | string>('all');
  const [focusFilter, setFocusFilter] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'createdAt' | 'updatedAt'>('priority');

  const loadItems = async () => {
    if (!currentProjId) return;
    try {
      setIsLoading(true);
      const [itemsData, versionsData, groupsData] = await Promise.all([
        workItemService.getWorkItems(currentProjId),
        versionService.getVersions(currentProjId),
        featureGroupService.getFeatureGroups(currentProjId),
      ]);
      setItems(itemsData.filter(i => !i.isDeleted));
      setVersions(versionsData);
      setFeatureGroups(groupsData);
    } catch (err) {
      console.error('Failed to load items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [currentProjId]);

  // Priority weight map
  const priorityWeight: Record<Priority, number> = { P0: 4, P1: 3, P2: 2, P3: 1 };

  const filteredAndSortedItems = items
    .filter(item => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchDesc = item.description?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc) return false;
      }
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false;
      if (sizeFilter !== 'all' && item.size !== sizeFilter) return false;
      if (versionFilter !== 'all') {
        if (versionFilter === 'backlog') {
          if (item.targetVersionId) return false;
        } else if (item.targetVersionId !== versionFilter) {
          return false;
        }
      }
      if (groupFilter !== 'all' && item.featureGroupId !== groupFilter) return false;
      if (focusFilter && !item.isFocus) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'priority') {
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate > b.dueDate ? 1 : -1;
      }
      if (sortBy === 'updatedAt') {
        return b.updatedAt > a.updatedAt ? 1 : -1;
      }
      // createdAt default
      return b.createdAt > a.createdAt ? 1 : -1;
    });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <ListTodo size={20} className="text-sky-400" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              All Work Items
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
              {filteredAndSortedItems.length} of {items.length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Search, filter, and sort every work item across the backlog and all releases.
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
          New Work Item
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="space-y-3">
        {/* Search & Sort Row */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full flex items-center">
            <Search size={15} className="absolute left-3 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search title, details, bug diagnostics..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#111827] border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setFocusFilter(!focusFilter)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${
                focusFilter
                  ? 'bg-amber-950/60 text-amber-400 border-amber-800/60'
                  : 'bg-[#111827] text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              ⭐ Focus Only
            </button>

            <div className="w-44">
              <Select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="text-xs py-1.5"
              >
                <option value="priority">Sort: Highest Priority</option>
                <option value="dueDate">Sort: Due Date</option>
                <option value="createdAt">Sort: Newest Created</option>
                <option value="updatedAt">Sort: Recently Updated</option>
              </Select>
            </div>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
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

          <Select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="text-xs py-1.5"
          >
            <option value="all">All Statuses</option>
            <option value="backlog">📥 Backlog</option>
            <option value="planned">🗓 Planned</option>
            <option value="in_progress">⚙️ In Progress</option>
            <option value="testing">🧪 Testing</option>
            <option value="completed">✅ Completed</option>
          </Select>

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

          <Select
            value={versionFilter}
            onChange={e => setVersionFilter(e.target.value)}
            className="text-xs py-1.5"
          >
            <option value="all">All Versions</option>
            <option value="backlog">Backlog (Unassigned)</option>
            {versions.map(v => (
              <option key={v.id} value={v.id}>
                v{v.versionNumber} ({v.title})
              </option>
            ))}
          </Select>

          <Select
            value={groupFilter}
            onChange={e => setGroupFilter(e.target.value)}
            className="text-xs py-1.5 col-span-2 sm:col-span-1"
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

      {/* Item List */}
      {filteredAndSortedItems.length === 0 ? (
        <EmptyState
          icon={<ListTodo size={28} className="text-slate-400" />}
          title="No matching work items"
          description="Try clearing filters or search queries to view items."
          actionText="Clear Filters"
          onAction={() => {
            setSearchQuery('');
            setTypeFilter('all');
            setStatusFilter('all');
            setPriorityFilter('all');
            setVersionFilter('all');
            setGroupFilter('all');
            setFocusFilter(false);
          }}
        />
      ) : (
        <div className="space-y-2.5">
          {filteredAndSortedItems.map(item => (
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
                loadItems();
              }}
            />
          ))}
        </div>
      )}

      {/* Item Modal */}
      {isItemModalOpen && (
        <WorkItemModal
          isOpen={isItemModalOpen}
          onClose={() => setIsItemModalOpen(false)}
          itemToEdit={selectedItem}
          defaultProjectId={currentProjId}
          availableVersions={versions}
          availableFeatureGroups={featureGroups}
          allProjectItems={items}
          onItemUpdated={loadItems}
        />
      )}
    </div>
  );
};
