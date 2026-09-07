import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { Project, ProjectStatus } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { ProjectModal } from './ProjectModal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  FolderKanban,
  Plus,
  ExternalLink,
  GitBranch,
  Milestone,
  Layers,
  Edit2,
  Archive,
  RotateCcw,
} from 'lucide-react';
import { workItemService } from '../../services/dbStore';

export const ProjectListPage: React.FC = () => {
  const { projects, setActiveProjectId, archiveProject, restoreProject } = useProject();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState<'all' | ProjectStatus>('all');
  const [selectedProjectForEdit, setSelectedProjectForEdit] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectToArchive, setProjectToArchive] = useState<Project | null>(null);
  const [itemCounts, setItemCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!user) return;
    workItemService.getAllUserWorkItems(user.uid).then(items => {
      const counts: Record<string, number> = {};
      items.filter(i => !i.isDeleted).forEach(i => {
        counts[i.projectId] = (counts[i.projectId] || 0) + 1;
      });
      setItemCounts(counts);
    });
  }, [user, projects]);

  const filteredProjects = projects.filter(p => {
    if (statusFilter === 'all') return true;
    return p.status === statusFilter;
  });

  const handleSelectProject = (proj: Project) => {
    setActiveProjectId(proj.id);
    navigate(`/projects/${proj.id}/overview`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Hentamo Projects
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Standalone apps, architectures, and platforms under the Hentamo umbrella.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={() => {
            setSelectedProjectForEdit(null);
            setIsModalOpen(true);
          }}
          leftIcon={<Plus size={14} />}
        >
          Create Project
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {(['all', 'active', 'on_hold', 'completed', 'archived'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3 py-1.5 rounded-lg capitalize transition-colors cursor-pointer ${
              statusFilter === tab
                ? 'bg-slate-800 text-sky-400 font-semibold border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban size={28} className="text-sky-400" />}
          title="No projects found"
          description="Create a project to start planning features, backlogs, versions and testing."
          actionText="Create New Project"
          onAction={() => {
            setSelectedProjectForEdit(null);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map(proj => {
            const count = itemCounts[proj.id] || 0;
            return (
              <Card
                key={proj.id}
                hoverable
                onClick={() => handleSelectProject(proj)}
                className="p-5 flex flex-col justify-between group relative"
              >
                <div>
                  {/* Top line with Color Tag & Status */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full shadow-sm"
                        style={{ backgroundColor: proj.color || '#38BDF8' }}
                      />
                      <span className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                        {proj.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-semibold bg-slate-800 text-slate-300">
                        {proj.status.replace('_', ' ')}
                      </span>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedProjectForEdit(proj);
                          setIsModalOpen(true);
                        }}
                        className="p-1 rounded text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Edit project"
                      >
                        <Edit2 size={13} />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {proj.description || 'No description specified.'}
                  </p>

                  {/* Platforms */}
                  {proj.platform && proj.platform.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {proj.platform.map(plat => (
                        <span
                          key={plat}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0B0F17] text-slate-400 border border-slate-800"
                        >
                          {plat}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Info */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    {proj.currentVersion && (
                      <span className="flex items-center gap-1 text-indigo-300">
                        <Milestone size={12} />
                        v{proj.currentVersion}
                      </span>
                    )}
                    <span className="text-slate-400">{count} work items</span>
                  </div>

                  {/* Links or Archive action */}
                  <div className="flex items-center gap-2">
                    {proj.repoUrl && (
                      <a
                        href={proj.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="text-slate-500 hover:text-white"
                        title="Repository"
                      >
                        <GitBranch size={13} />
                      </a>
                    )}
                    {proj.prodUrl && (
                      <a
                        href={proj.prodUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="text-slate-500 hover:text-sky-400"
                        title="Production URL"
                      >
                        <ExternalLink size={13} />
                      </a>
                    )}
                    {proj.status === 'archived' ? (
                      <button
                        onClick={async e => {
                          e.stopPropagation();
                          await restoreProject(proj.id);
                        }}
                        className="text-emerald-400 hover:text-emerald-300 p-1"
                        title="Restore Project"
                      >
                        <RotateCcw size={13} />
                      </button>
                    ) : (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setProjectToArchive(proj);
                        }}
                        className="text-slate-600 hover:text-rose-400 p-1"
                        title="Archive Project"
                      >
                        <Archive size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Project Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projectToEdit={selectedProjectForEdit}
      />

      {/* Confirm Archive Modal */}
      {projectToArchive && (
        <ConfirmDialog
          isOpen={Boolean(projectToArchive)}
          onClose={() => setProjectToArchive(null)}
          onConfirm={async () => {
            await archiveProject(projectToArchive.id);
            setProjectToArchive(null);
          }}
          title={`Archive Project "${projectToArchive.name}"?`}
          message="This project and its modules will be moved to the Archive. It can be restored anytime."
          confirmText="Archive Project"
          variant="danger"
        />
      )}
    </div>
  );
};
