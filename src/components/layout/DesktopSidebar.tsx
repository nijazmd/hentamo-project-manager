import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Star,
  Archive,
  Inbox,
  Milestone,
  ListTodo,
  FlaskConical,
  Layers,
  Plus,
  ChevronDown,
  LogOut,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';

interface DesktopSidebarProps {
  onOpenQuickCapture: () => void;
  onOpenNewProject: () => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  onOpenQuickCapture,
  onOpenNewProject,
}) => {
  const { projects, activeProject, setActiveProjectId } = useProject();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);

  const activeProjects = projects.filter(p => p.status !== 'archived');

  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#0E1522] border-r border-slate-800/80 h-screen sticky top-0 shrink-0 select-none z-30">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/70 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center font-black text-white text-sm shadow-md shadow-sky-500/20">
            H
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white leading-none">
              Hentamo Apps
            </h1>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
              Project Manager
            </span>
          </div>
        </div>
      </div>

      {/* Project Switcher */}
      <div className="p-3 border-b border-slate-800/60 relative">
        <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1 px-1">
          Active Workspace
        </label>
        <button
          onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#141C2B] hover:bg-[#182337] border border-slate-800 text-left transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: activeProject?.color || '#64748B' }}
            />
            <span className="text-sm font-medium text-slate-200 truncate">
              {activeProject ? activeProject.name : (projects.length === 0 ? 'No Projects Yet' : 'Select Project')}
            </span>
          </div>
          <ChevronDown size={14} className="text-slate-400 shrink-0 ml-1" />
        </button>

        {isProjectDropdownOpen && (
          <div className="absolute left-3 right-3 top-[68px] bg-[#141C2B] border border-slate-700/80 rounded-xl shadow-2xl z-50 p-1.5 space-y-0.5">
            <div className="max-h-48 overflow-y-auto space-y-0.5">
              {activeProjects.length === 0 && (
                <div className="px-2.5 py-2 text-xs text-slate-500 italic">
                  No projects created yet
                </div>
              )}
              {activeProjects.map(proj => (
                <button
                  key={proj.id}
                  onClick={() => {
                    setActiveProjectId(proj.id);
                    setIsProjectDropdownOpen(false);
                    navigate(`/projects/${proj.id}/overview`);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                    activeProject?.id === proj.id
                      ? 'bg-sky-500/20 text-sky-300 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: proj.color || '#38BDF8' }}
                    />
                    <span className="truncate">{proj.name}</span>
                  </div>
                  {proj.currentVersion && (
                    <span className="text-[10px] font-mono text-slate-400">v{proj.currentVersion}</span>
                  )}
                </button>
              ))}
            </div>

            <div className="pt-1.5 mt-1 border-t border-slate-800">
              <button
                onClick={() => {
                  setIsProjectDropdownOpen(false);
                  onOpenNewProject();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-sky-400 hover:bg-sky-950/40 transition-colors cursor-pointer font-medium"
              >
                <Plus size={13} />
                Create New Project
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Action Button */}
      <div className="px-3 py-2.5">
        <button
          onClick={onOpenQuickCapture}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold shadow-lg shadow-sky-500/20 transition-all cursor-pointer active:scale-[0.98]"
        >
          <Zap size={14} />
          <span>Quick Capture</span>
          <kbd className="ml-auto text-[10px] bg-black/25 px-1.5 py-0.5 rounded font-mono text-sky-100">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
        {/* Primary Command Center */}
        <div>
          <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 px-2 mb-1.5">
            Command Center
          </span>
          <nav className="space-y-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800/90 text-white font-semibold border-l-2 border-sky-400 pl-2'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`
              }
            >
              <LayoutDashboard size={15} />
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/projects"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800/90 text-white font-semibold border-l-2 border-sky-400 pl-2'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`
              }
            >
              <FolderKanban size={15} />
              <span>Projects</span>
            </NavLink>

            <NavLink
              to="/focus"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800/90 text-amber-300 font-semibold border-l-2 border-amber-400 pl-2'
                    : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800/40'
                }`
              }
            >
              <Star size={15} className="text-amber-400" />
              <span>My Focus</span>
            </NavLink>

            <NavLink
              to="/archive"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800/90 text-white font-semibold border-l-2 border-sky-400 pl-2'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`
              }
            >
              <Archive size={15} />
              <span>Global Archive</span>
            </NavLink>
          </nav>
        </div>

        {/* Project Specific Navigation */}
        {activeProject && (
          <div>
            <div className="flex items-center justify-between px-2 mb-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                {activeProject.name} Modules
              </span>
            </div>
            <nav className="space-y-1">
              <NavLink
                to={`/projects/${activeProject.id}/overview`}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-800/90 text-white font-semibold border-l-2 border-sky-400 pl-2'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`
                }
              >
                <FolderKanban size={15} />
                <span>Overview</span>
              </NavLink>

              <NavLink
                to={`/projects/${activeProject.id}/backlog`}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-800/90 text-white font-semibold border-l-2 border-sky-400 pl-2'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`
                }
              >
                <Inbox size={15} />
                <span>Backlog</span>
              </NavLink>

              <NavLink
                to={`/projects/${activeProject.id}/versions`}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-800/90 text-white font-semibold border-l-2 border-sky-400 pl-2'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`
                }
              >
                <Milestone size={15} />
                <span>Versions</span>
              </NavLink>

              <NavLink
                to={`/projects/${activeProject.id}/items`}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-800/90 text-white font-semibold border-l-2 border-sky-400 pl-2'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`
                }
              >
                <ListTodo size={15} />
                <span>All Items</span>
              </NavLink>

              <NavLink
                to={`/projects/${activeProject.id}/testing`}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-800/90 text-white font-semibold border-l-2 border-purple-400 pl-2'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`
                }
              >
                <FlaskConical size={15} className="text-purple-400" />
                <span>Testing Hub</span>
              </NavLink>

              <NavLink
                to={`/projects/${activeProject.id}/feature-groups`}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-800/90 text-white font-semibold border-l-2 border-sky-400 pl-2'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`
                }
              >
                <Layers size={15} />
                <span>Feature Groups</span>
              </NavLink>

              <NavLink
                to={`/projects/${activeProject.id}/archive`}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-800/90 text-white font-semibold border-l-2 border-slate-400 pl-2'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`
                }
              >
                <Archive size={15} />
                <span>Project Archive</span>
              </NavLink>
            </nav>
          </div>
        )}
      </div>

      {/* Footer User Info */}
      <div className="p-3 border-t border-slate-800/70 bg-[#0A101C]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-sky-400 shrink-0">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'H'}
            </div>
            <div className="truncate">
              <p className="text-xs font-medium text-slate-200 truncate">
                {user?.displayName || 'Nijas Moideen'}
              </p>
              <p className="text-[10px] text-slate-400 font-mono truncate">
                {user?.email || 'developer@hentamo.com'}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
            title="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
};
