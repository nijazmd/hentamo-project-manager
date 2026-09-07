import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { workItemService, versionService } from '../../services/dbStore';
import { WorkItem, Version } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { WorkItemCard } from '../../components/workItems/WorkItemCard';
import { WorkItemModal } from '../workItems/WorkItemModal';
import { ProjectModal } from '../projects/ProjectModal';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDate } from '../../utils/dateUtils';
import {
  FolderKanban,
  PlayCircle,
  FlaskConical,
  AlertCircle,
  Bug,
  Star,
  Milestone,
  Calendar,
  Plus,
  ArrowUpRight,
  Zap,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { projects, activeProject, setActiveProjectId } = useProject();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [allUserItems, setAllUserItems] = useState<WorkItem[]>([]);
  const [allVersions, setAllVersions] = useState<Version[]>([]);
  const [selectedItem, setSelectedItem] = useState<WorkItem | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const items = await workItemService.getAllUserWorkItems(user.uid);
      setAllUserItems(items.filter(i => !i.isDeleted));

      // Fetch all versions for all user's projects
      const versionPromises = projects.map(p => versionService.getVersions(p.id));
      const versionsArrays = await Promise.all(versionPromises);
      setAllVersions(versionsArrays.flat());
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, projects]);

  // Calculations
  const activeProjectsCount = projects.filter(p => p.status === 'active').length;
  const onHoldProjectsCount = projects.filter(p => p.status === 'on_hold').length;

  const inProgressItems = allUserItems.filter(i => i.status === 'in_progress');
  const testingItems = allUserItems.filter(i => i.status === 'testing');
  const criticalItems = allUserItems.filter(
    i => (i.priority === 'P0' || i.priority === 'P1') && i.status !== 'completed'
  );
  const openBugs = allUserItems.filter(i => i.type === 'bug' && i.status !== 'completed');
  const focusItems = allUserItems.filter(i => i.isFocus && i.status !== 'completed');

  // Upcoming items with due dates
  const upcomingItems = allUserItems
    .filter(i => i.dueDate && i.status !== 'completed')
    .sort((a, b) => (a.dueDate! > b.dueDate! ? 1 : -1))
    .slice(0, 5);

  // Upcoming version target dates
  const upcomingVersions = allVersions
    .filter(v => v.targetDate && v.status !== 'released' && v.status !== 'archived')
    .sort((a, b) => (a.targetDate! > b.targetDate! ? 1 : -1))
    .slice(0, 4);

  const getProjectName = (projId: string) => {
    return projects.find(p => p.id === projId)?.name || 'Project';
  };

  const getProjectColor = (projId: string) => {
    return projects.find(p => p.id === projId)?.color || '#38BDF8';
  };

  const handleToggleFocus = async (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    await workItemService.toggleFocus(itemId);
    loadData();
  };

  if (projects.length === 0 && !isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto flex-1 flex flex-col justify-center items-center">
        <EmptyState
          icon={<FolderKanban size={28} className="text-sky-400" />}
          title="Welcome to Hentamo Apps Project Manager"
          description="Manage your apps, features, bugs, versions and testing in one place."
          actionText="+ Create Your First Project"
          onAction={() => setIsNewProjectModalOpen(true)}
        />
        <ProjectModal
          isOpen={isNewProjectModalOpen}
          onClose={() => setIsNewProjectModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Command Center
            </h1>
            <span className="text-xs font-mono bg-sky-950/60 text-sky-400 border border-sky-800/60 px-2 py-0.5 rounded-full font-semibold">
              Live
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time overview of all Hentamo Apps projects, milestones, and testing gates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate('/projects')}
            leftIcon={<FolderKanban size={14} />}
          >
            All Projects ({projects.length})
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
            New Work Item
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Projects Metric */}
        <Card className="p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Projects</span>
            <FolderKanban size={16} className="text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{activeProjectsCount}</span>
            <span className="text-xs text-emerald-400 font-medium">Active</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{onHoldProjectsCount} on hold</p>
        </Card>

        {/* In Progress Metric */}
        <Card className="p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Development</span>
            <PlayCircle size={16} className="text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{inProgressItems.length}</span>
            <span className="text-xs text-blue-400 font-medium">In Progress</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Across all projects</p>
        </Card>

        {/* Testing Metric */}
        <Card className="p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Quality Gate</span>
            <FlaskConical size={16} className="text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{testingItems.length}</span>
            <span className="text-xs text-purple-400 font-medium">In Testing</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Awaiting verification</p>
        </Card>

        {/* Bugs & P0/P1 Metric */}
        <Card className="p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Attention</span>
            <Bug size={16} className="text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{openBugs.length}</span>
            <span className="text-xs text-rose-400 font-medium">Bugs</span>
          </div>
          <p className="text-[11px] text-rose-400 font-medium mt-1">
            {criticalItems.length} Critical P0/P1
          </p>
        </Card>
      </div>

      {/* MY FOCUS Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star size={18} className="text-amber-400 fill-amber-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              My Focus
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              ({focusItems.length} items pinned)
            </span>
          </div>
          <Button
            size="xs"
            variant="ghost"
            onClick={() => navigate('/focus')}
            className="text-amber-400 hover:text-amber-300"
          >
            Manage Focus
          </Button>
        </div>

        {focusItems.length === 0 ? (
          <Card className="p-6 text-center border-dashed border-slate-800">
            <p className="text-xs text-slate-400">
              No items currently marked with ⭐ Focus. Click the star icon on any work item to pin it here.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {focusItems.map(item => (
              <WorkItemCard
                key={item.id}
                item={item}
                projectName={getProjectName(item.projectId)}
                version={allVersions.find(v => v.id === item.targetVersionId)}
                onClick={() => {
                  setSelectedItem(item);
                  setIsItemModalOpen(true);
                }}
                onToggleFocus={e => handleToggleFocus(e, item.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Two Column Layout: Upcoming Versions & Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Versions */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Milestone size={16} className="text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Upcoming Releases</h3>
            </div>
          </div>

          {upcomingVersions.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-4 text-center">
              No upcoming versions scheduled.
            </p>
          ) : (
            <div className="space-y-3">
              {upcomingVersions.map(v => (
                <div
                  key={v.id}
                  onClick={() => {
                    setActiveProjectId(v.projectId);
                    navigate(`/projects/${v.projectId}/versions/${v.id}`);
                  }}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#0B0F17] border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer group"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getProjectColor(v.projectId) }}
                      />
                      <span className="text-xs font-mono font-bold text-sky-400">
                        {getProjectName(v.projectId)} v{v.versionNumber}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-200 truncate mt-0.5 group-hover:text-sky-300">
                      {v.title}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 justify-end">
                      <Calendar size={11} />
                      {formatDate(v.targetDate)}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-indigo-400">
                      {v.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Upcoming Due Dates */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-sky-400" />
              <h3 className="text-sm font-bold text-white">Upcoming Deadlines</h3>
            </div>
          </div>

          {upcomingItems.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-4 text-center">
              No upcoming work item deadlines.
            </p>
          ) : (
            <div className="space-y-3">
              {upcomingItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedItem(item);
                    setIsItemModalOpen(true);
                  }}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#0B0F17] border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer group"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                        {getProjectName(item.projectId)}
                      </span>
                      <span className="text-xs font-medium text-slate-200 truncate group-hover:text-sky-300">
                        {item.title}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-medium text-sky-400">
                      {formatDate(item.dueDate)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Work Item Edit / Create Modal */}
      {isItemModalOpen && (
        <WorkItemModal
          isOpen={isItemModalOpen}
          onClose={() => setIsItemModalOpen(false)}
          itemToEdit={selectedItem}
          availableVersions={allVersions}
          availableFeatureGroups={[]}
          allProjectItems={allUserItems}
          onItemUpdated={loadData}
        />
      )}
    </div>
  );
};
