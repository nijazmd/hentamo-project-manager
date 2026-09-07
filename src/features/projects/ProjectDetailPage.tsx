import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '../../context/ProjectContext';
import { workItemService, versionService, featureGroupService } from '../../services/dbStore';
import { WorkItem, Version, FeatureGroup } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { WorkItemCard } from '../../components/workItems/WorkItemCard';
import { WorkItemModal } from '../workItems/WorkItemModal';
import { ProgressBar } from '../../components/common/ProgressBar';
import { formatDate } from '../../utils/dateUtils';
import {
  Inbox,
  Milestone,
  PlayCircle,
  FlaskConical,
  Bug,
  CheckCircle2,
  Plus,
  ExternalLink,
  GitBranch,
  Calendar,
  Layers,
  ListTodo,
} from 'lucide-react';

export const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { projects, activeProject, setActiveProjectId } = useProject();
  const navigate = useNavigate();

  const currentProject = projects.find(p => p.id === projectId) || activeProject;

  const [items, setItems] = useState<WorkItem[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);
  const [featureGroups, setFeatureGroups] = useState<FeatureGroup[]>([]);
  const [selectedItem, setSelectedItem] = useState<WorkItem | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadProjectData = async () => {
    if (!currentProject) return;
    try {
      setIsLoading(true);
      const [itemsData, versionsData, groupsData] = await Promise.all([
        workItemService.getWorkItems(currentProject.id),
        versionService.getVersions(currentProject.id),
        featureGroupService.getFeatureGroups(currentProject.id),
      ]);
      setItems(itemsData.filter(i => !i.isDeleted));
      setVersions(versionsData);
      setFeatureGroups(groupsData);
    } catch (err) {
      console.error('Failed to load project overview:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (projectId && currentProject?.id !== projectId) {
      setActiveProjectId(projectId);
    }
    loadProjectData();
  }, [projectId, currentProject?.id]);

  if (!currentProject) {
    return (
      <div className="p-8 text-center text-slate-400">
        Project not found.
      </div>
    );
  }

  // Project Metrics
  const backlogItems = items.filter(i => !i.targetVersionId && i.status !== 'completed');
  const inProgressItems = items.filter(i => i.status === 'in_progress');
  const testingItems = items.filter(i => i.status === 'testing');
  const openBugs = items.filter(i => i.type === 'bug' && i.status !== 'completed');
  const completedItems = items.filter(i => i.status === 'completed');

  // Overall Project Progress
  const totalItems = items.length;
  const completedTotal = completedItems.length;
  const progressPercentage = totalItems > 0 ? Math.round((completedTotal / totalItems) * 100) : 0;

  // Active or Upcoming Versions
  const activeVersions = versions.filter(v => v.status !== 'archived' && v.status !== 'released');

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Project Banner Header */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#111827] border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span
                className="w-3.5 h-3.5 rounded-full"
                style={{ backgroundColor: currentProject.color || '#38BDF8' }}
              />
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {currentProject.name} Overview
              </h1>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-semibold bg-slate-800 text-slate-300">
                {currentProject.status}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              {currentProject.description}
            </p>

            {/* Platform & External Links */}
            <div className="flex items-center gap-3 pt-2 text-xs text-slate-400 flex-wrap">
              {currentProject.currentVersion && (
                <span className="text-indigo-300 font-mono bg-indigo-950/40 border border-indigo-800/40 px-2 py-0.5 rounded">
                  Current: v{currentProject.currentVersion}
                </span>
              )}
              {currentProject.repoUrl && (
                <a
                  href={currentProject.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  <GitBranch size={13} /> Repository
                </a>
              )}
              {currentProject.prodUrl && (
                <a
                  href={currentProject.prodUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-sky-400 hover:text-sky-300 transition-colors"
                >
                  <ExternalLink size={13} /> Live App
                </a>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => navigate(`/projects/${currentProject.id}/backlog`)}
              leftIcon={<Inbox size={14} />}
            >
              Open Backlog
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
              New Item
            </Button>
          </div>
        </div>

        {/* Overall Completion Progress */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <ProgressBar
            completed={completedTotal}
            total={totalItems}
            testing={testingItems.length}
            size="md"
          />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card
          hoverable
          onClick={() => navigate(`/projects/${currentProject.id}/backlog`)}
          className="p-4"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Backlog</span>
            <Inbox size={16} className="text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{backlogItems.length}</div>
          <span className="text-[11px] text-slate-500">Unassigned items</span>
        </Card>

        <Card
          hoverable
          onClick={() => navigate(`/projects/${currentProject.id}/items`)}
          className="p-4"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">In Progress</span>
            <PlayCircle size={16} className="text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400 font-mono">{inProgressItems.length}</div>
          <span className="text-[11px] text-slate-500">Actively coding</span>
        </Card>

        <Card
          hoverable
          onClick={() => navigate(`/projects/${currentProject.id}/testing`)}
          className="p-4"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Testing</span>
            <FlaskConical size={16} className="text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400 font-mono">{testingItems.length}</div>
          <span className="text-[11px] text-slate-500">Awaiting test pass</span>
        </Card>

        <Card
          hoverable
          onClick={() => navigate(`/projects/${currentProject.id}/items`)}
          className="p-4"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Open Bugs</span>
            <Bug size={16} className="text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 font-mono">{openBugs.length}</div>
          <span className="text-[11px] text-rose-400">Issues to resolve</span>
        </Card>
      </div>

      {/* Two columns: Active Versions & In Progress Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Versions list */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Milestone size={16} className="text-indigo-400" />
              Active Versions ({activeVersions.length})
            </h3>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => navigate(`/projects/${currentProject.id}/versions`)}
            >
              View All
            </Button>
          </div>

          <div className="space-y-3">
            {activeVersions.length === 0 ? (
              <Card className="p-6 text-center border-dashed border-slate-800">
                <p className="text-xs text-slate-400">No active versions in development.</p>
              </Card>
            ) : (
              activeVersions.map(v => {
                const versionItems = items.filter(i => i.targetVersionId === v.id);
                const versionCompleted = versionItems.filter(i => i.status === 'completed').length;
                const versionTesting = versionItems.filter(i => i.status === 'testing').length;

                return (
                  <Card
                    key={v.id}
                    hoverable
                    onClick={() => navigate(`/projects/${currentProject.id}/versions/${v.id}`)}
                    className="p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold font-mono text-sky-400">
                            v{v.versionNumber}
                          </span>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded font-semibold bg-indigo-950/60 text-indigo-300 border border-indigo-800/50">
                            {v.status}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-slate-200 mt-1">
                          {v.title}
                        </h4>
                      </div>

                      {v.targetDate && (
                        <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                          <Calendar size={11} />
                          {formatDate(v.targetDate)}
                        </span>
                      )}
                    </div>

                    <ProgressBar
                      completed={versionCompleted}
                      total={versionItems.length}
                      testing={versionTesting}
                      size="sm"
                    />
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* Current In-Progress / Testing work items */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PlayCircle size={16} className="text-blue-400" />
              Active Work Items ({inProgressItems.length + testingItems.length})
            </h3>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => navigate(`/projects/${currentProject.id}/items`)}
            >
              View All Items
            </Button>
          </div>

          <div className="space-y-2.5">
            {[...testingItems, ...inProgressItems].length === 0 ? (
              <Card className="p-6 text-center border-dashed border-slate-800">
                <p className="text-xs text-slate-400">
                  No items in progress or testing right now.
                </p>
              </Card>
            ) : (
              [...testingItems, ...inProgressItems].slice(0, 5).map(item => (
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
                    loadProjectData();
                  }}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Work Item Edit Modal */}
      {isItemModalOpen && (
        <WorkItemModal
          isOpen={isItemModalOpen}
          onClose={() => setIsItemModalOpen(false)}
          itemToEdit={selectedItem}
          defaultProjectId={currentProject.id}
          availableVersions={versions}
          availableFeatureGroups={featureGroups}
          allProjectItems={items}
          onItemUpdated={loadProjectData}
        />
      )}
    </div>
  );
};
