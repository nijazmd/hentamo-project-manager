import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '../../context/ProjectContext';
import { versionService, workItemService } from '../../services/dbStore';
import { Version, WorkItem, VersionStatus } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ProgressBar } from '../../components/common/ProgressBar';
import { EmptyState } from '../../components/common/EmptyState';
import { VersionModal } from './VersionModal';
import { formatDate } from '../../utils/dateUtils';
import { Milestone, Plus, Calendar, Edit2, ArrowRight } from 'lucide-react';

export const VersionListPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { activeProject } = useProject();
  const currentProjId = projectId || activeProject?.id;
  const navigate = useNavigate();

  const [versions, setVersions] = useState<Version[]>([]);
  const [items, setItems] = useState<WorkItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | VersionStatus>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVersionForEdit, setSelectedVersionForEdit] = useState<Version | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadVersions = async () => {
    if (!currentProjId) return;
    try {
      setIsLoading(true);
      const [vData, iData] = await Promise.all([
        versionService.getVersions(currentProjId),
        workItemService.getWorkItems(currentProjId),
      ]);
      setVersions(vData);
      setItems(iData.filter(i => !i.isDeleted));
    } catch (err) {
      console.error('Failed to load versions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVersions();
  }, [currentProjId]);

  const filteredVersions = versions.filter(v => {
    if (statusFilter === 'all') return true;
    return v.status === statusFilter;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Milestone size={20} className="text-indigo-400" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Release Versions
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
              {versions.length} releases
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track milestones, target release dates, QA gates, and completed scope.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={() => {
            setSelectedVersionForEdit(null);
            setIsModalOpen(true);
          }}
          leftIcon={<Plus size={14} />}
        >
          Create Version
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {(['all', 'planning', 'development', 'testing', 'released', 'archived'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3 py-1.5 rounded-lg capitalize transition-colors cursor-pointer ${
              statusFilter === tab
                ? 'bg-slate-800 text-indigo-400 font-semibold border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Versions List */}
      {filteredVersions.length === 0 ? (
        <EmptyState
          icon={<Milestone size={28} className="text-indigo-400" />}
          title="No versions created yet."
          description="Create a version to schedule features and calculate completion progress."
          actionText="Create Version"
          onAction={() => {
            setSelectedVersionForEdit(null);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredVersions.map(v => {
            const vItems = items.filter(i => i.targetVersionId === v.id);
            const completedCount = vItems.filter(i => i.status === 'completed').length;
            const testingCount = vItems.filter(i => i.status === 'testing').length;
            const inProgressCount = vItems.filter(i => i.status === 'in_progress').length;
            const plannedCount = vItems.filter(i => i.status === 'planned').length;

            return (
              <Card
                key={v.id}
                hoverable
                onClick={() => navigate(`/projects/${currentProjId}/versions/${v.id}`)}
                className="p-5 flex flex-col justify-between group relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold font-mono text-sky-400">
                        v{v.versionNumber}
                      </span>
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-sky-300 transition-colors">
                        {v.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold bg-indigo-950/60 text-indigo-300 border border-indigo-800/40">
                        {v.status}
                      </span>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedVersionForEdit(v);
                          setIsModalOpen(true);
                        }}
                        className="p-1 rounded text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Edit version"
                      >
                        <Edit2 size={13} />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {v.description || 'No release goals specified.'}
                  </p>
                </div>

                {/* Progress Bar with strictly Completed count */}
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <ProgressBar
                    completed={completedCount}
                    total={vItems.length}
                    testing={testingCount}
                    size="sm"
                  />

                  {/* Status pills breakdown */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <div className="flex items-center gap-3">
                      <span>Planned: {plannedCount}</span>
                      <span>Dev: {inProgressCount}</span>
                      <span className="text-purple-400 font-medium">Test: {testingCount}</span>
                      <span className="text-emerald-400 font-medium">Done: {completedCount}</span>
                    </div>

                    {v.targetDate && (
                      <span className="flex items-center gap-1 text-slate-400">
                        <Calendar size={11} />
                        {formatDate(v.targetDate)}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Version Modal */}
      {currentProjId && (
        <VersionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          projectId={currentProjId}
          versionToEdit={selectedVersionForEdit}
          onVersionSaved={loadVersions}
        />
      )}
    </div>
  );
};
