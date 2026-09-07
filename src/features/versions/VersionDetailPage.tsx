import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { versionService, workItemService, featureGroupService } from '../../services/dbStore';
import { Version, WorkItem, FeatureGroup } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ProgressBar } from '../../components/common/ProgressBar';
import { WorkItemCard } from '../../components/workItems/WorkItemCard';
import { WorkItemModal } from '../workItems/WorkItemModal';
import { VersionModal } from './VersionModal';
import { formatDate } from '../../utils/dateUtils';
import {
  Milestone,
  Calendar,
  Sparkles,
  Wrench,
  CheckSquare,
  Bug,
  Plus,
  ArrowLeft,
  Edit2,
  Layers,
} from 'lucide-react';

export const VersionDetailPage: React.FC = () => {
  const { projectId, versionId } = useParams<{ projectId: string; versionId: string }>();
  const navigate = useNavigate();

  const [version, setVersion] = useState<Version | null>(null);
  const [items, setItems] = useState<WorkItem[]>([]);
  const [allProjectItems, setAllProjectItems] = useState<WorkItem[]>([]);
  const [allVersions, setAllVersions] = useState<Version[]>([]);
  const [featureGroups, setFeatureGroups] = useState<FeatureGroup[]>([]);
  const [selectedItem, setSelectedItem] = useState<WorkItem | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isVersionEditModalOpen, setIsVersionEditModalOpen] = useState(false);
  const [groupBy, setGroupBy] = useState<'type' | 'status'>('type');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    if (!versionId || !projectId) return;
    try {
      setIsLoading(true);
      const [v, pItems, pVersions, pGroups] = await Promise.all([
        versionService.getVersion(versionId),
        workItemService.getWorkItems(projectId),
        versionService.getVersions(projectId),
        featureGroupService.getFeatureGroups(projectId),
      ]);
      setVersion(v);
      setAllProjectItems(pItems.filter(i => !i.isDeleted));
      setItems(pItems.filter(i => i.targetVersionId === versionId && !i.isDeleted));
      setAllVersions(pVersions);
      setFeatureGroups(pGroups);
    } catch (err) {
      console.error('Failed to load version details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId, versionId]);

  if (!version) {
    return (
      <div className="p-8 text-center text-slate-400">
        Version not found.
      </div>
    );
  }

  // Progress metrics (Strictly Completed counts as fully completed)
  const completedCount = items.filter(i => i.status === 'completed').length;
  const testingCount = items.filter(i => i.status === 'testing').length;
  const inProgressCount = items.filter(i => i.status === 'in_progress').length;
  const plannedCount = items.filter(i => i.status === 'planned').length;
  const totalCount = items.length;

  // Grouped by Type
  const features = items.filter(i => i.type === 'feature');
  const improvements = items.filter(i => i.type === 'improvement');
  const tasks = items.filter(i => i.type === 'task');
  const bugs = items.filter(i => i.type === 'bug');
  const tests = items.filter(i => i.type === 'test');
  const ideas = items.filter(i => i.type === 'idea');

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Back button & Title Bar */}
      <div>
        <button
          onClick={() => navigate(`/projects/${projectId}/versions`)}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 mb-3 transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Versions
        </button>

        <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="text-xl sm:text-2xl font-bold font-mono text-sky-400">
                  v{version.versionNumber}
                </span>
                <h1 className="text-lg sm:text-xl font-bold text-white">
                  {version.title}
                </h1>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-semibold bg-indigo-950/60 text-indigo-300 border border-indigo-800/40">
                  {version.status}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                {version.description || 'No release goals specified.'}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setIsVersionEditModalOpen(true)}
                leftIcon={<Edit2 size={13} />}
              >
                Edit Version
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  setSelectedItem(null);
                  setIsItemModalOpen(true);
                }}
                leftIcon={<Plus size={14} />}
              >
                Add Work Item
              </Button>
            </div>
          </div>

          {/* Version Dates & Progress Bar */}
          <div className="pt-3 border-t border-slate-800/80 space-y-3">
            <ProgressBar
              completed={completedCount}
              total={totalCount}
              testing={testingCount}
              size="md"
            />

            <div className="flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
              <div className="flex items-center gap-3 font-mono">
                <span>Completed: <strong className="text-emerald-400">{completedCount}</strong></span>
                <span>Testing: <strong className="text-purple-400">{testingCount}</strong></span>
                <span>In Progress: <strong className="text-blue-400">{inProgressCount}</strong></span>
                <span>Planned: <strong className="text-indigo-400">{plannedCount}</strong></span>
              </div>

              <div className="flex items-center gap-4 font-mono text-[11px]">
                {version.targetDate && (
                  <span className="flex items-center gap-1 text-slate-400">
                    <Calendar size={12} /> Target: {formatDate(version.targetDate)}
                  </span>
                )}
                {version.releaseDate && (
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    🚀 Released: {formatDate(version.releaseDate)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grouping Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
          Scope Breakdown ({totalCount} items)
        </span>

        <div className="flex items-center gap-1 bg-[#111827] p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setGroupBy('type')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer ${
              groupBy === 'type' ? 'bg-slate-800 text-sky-400 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Group by Type
          </button>
          <button
            onClick={() => setGroupBy('status')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer ${
              groupBy === 'status' ? 'bg-slate-800 text-sky-400 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Group by Status
          </button>
        </div>
      </div>

      {/* Grouped Lists */}
      {groupBy === 'type' ? (
        <div className="space-y-6">
          {/* Features */}
          {features.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                <Sparkles size={14} /> Features ({features.length})
              </h3>
              <div className="space-y-2">
                {features.map(item => (
                  <WorkItemCard
                    key={item.id}
                    item={item}
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
            </div>
          )}

          {/* Improvements */}
          {improvements.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Wrench size={14} /> Improvements ({improvements.length})
              </h3>
              <div className="space-y-2">
                {improvements.map(item => (
                  <WorkItemCard
                    key={item.id}
                    item={item}
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
            </div>
          )}

          {/* Tasks */}
          {tasks.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <CheckSquare size={14} /> Tasks ({tasks.length})
              </h3>
              <div className="space-y-2">
                {tasks.map(item => (
                  <WorkItemCard
                    key={item.id}
                    item={item}
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
            </div>
          )}

          {/* Bugs */}
          {bugs.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <Bug size={14} /> Bugs ({bugs.length})
              </h3>
              <div className="space-y-2">
                {bugs.map(item => (
                  <WorkItemCard
                    key={item.id}
                    item={item}
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
            </div>
          )}

          {/* Tests or Ideas if present */}
          {(tests.length > 0 || ideas.length > 0) && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Other Items ({tests.length + ideas.length})
              </h3>
              <div className="space-y-2">
                {[...tests, ...ideas].map(item => (
                  <WorkItemCard
                    key={item.id}
                    item={item}
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
            </div>
          )}
        </div>
      ) : (
        /* Group by Status */
        <div className="space-y-6">
          {(['in_progress', 'testing', 'planned', 'completed'] as const).map(st => {
            const statusItems = items.filter(i => i.status === st);
            if (statusItems.length === 0) return null;
            return (
              <div key={st} className="space-y-2.5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  {st.replace('_', ' ')} ({statusItems.length})
                </h3>
                <div className="space-y-2">
                  {statusItems.map(item => (
                    <WorkItemCard
                      key={item.id}
                      item={item}
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
              </div>
            );
          })}
        </div>
      )}

      {/* Work Item Edit Modal */}
      {isItemModalOpen && (
        <WorkItemModal
          isOpen={isItemModalOpen}
          onClose={() => setIsItemModalOpen(false)}
          itemToEdit={selectedItem}
          defaultProjectId={projectId}
          defaultVersionId={versionId}
          availableVersions={allVersions}
          availableFeatureGroups={featureGroups}
          allProjectItems={allProjectItems}
          onItemUpdated={loadData}
        />
      )}

      {/* Version Edit Modal */}
      {isVersionEditModalOpen && projectId && (
        <VersionModal
          isOpen={isVersionEditModalOpen}
          onClose={() => setIsVersionEditModalOpen(false)}
          projectId={projectId}
          versionToEdit={version}
          onVersionSaved={loadData}
        />
      )}
    </div>
  );
};
