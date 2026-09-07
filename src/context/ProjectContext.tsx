import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Project } from '../types';
import { projectService } from '../services/dbStore';
import { useAuth } from './AuthContext';

interface ProjectContextType {
  projects: Project[];
  activeProject: Project | null;
  isLoadingProjects: boolean;
  setActiveProject: (project: Project | null) => void;
  setActiveProjectId: (projectId: string) => void;
  refreshProjects: () => Promise<void>;
  createProject: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<Project>;
  archiveProject: (id: string) => Promise<void>;
  restoreProject: (id: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const ACTIVE_PROJ_KEY = 'hentamo_active_project_id';

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  const refreshProjects = useCallback(async () => {
    if (!user) {
      setProjects([]);
      setActiveProject(null);
      setIsLoadingProjects(false);
      return;
    }
    try {
      setIsLoadingProjects(true);
      const list = await projectService.getProjects(user.uid);
      setProjects(list);

      const savedProjId = localStorage.getItem(ACTIVE_PROJ_KEY);
      const activeList = list.filter(p => p.status !== 'archived');

      if (savedProjId) {
        const found = list.find(p => p.id === savedProjId);
        if (found) {
          setActiveProject(found);
          return;
        }
        localStorage.removeItem(ACTIVE_PROJ_KEY);
      }

      if (activeList.length > 0) {
        setActiveProject(activeList[0]);
        localStorage.setItem(ACTIVE_PROJ_KEY, activeList[0].id);
      } else {
        setActiveProject(null);
        localStorage.removeItem(ACTIVE_PROJ_KEY);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setIsLoadingProjects(false);
    }
  }, [user]);

  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  const handleSetActiveProject = (proj: Project | null) => {
    setActiveProject(proj);
    if (proj) {
      localStorage.setItem(ACTIVE_PROJ_KEY, proj.id);
    } else {
      localStorage.removeItem(ACTIVE_PROJ_KEY);
    }
  };

  const setActiveProjectId = (projectId: string) => {
    const found = projects.find(p => p.id === projectId);
    if (found) {
      handleSetActiveProject(found);
    }
  };

  const createProject = async (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> => {
    const created = await projectService.createProject(data);
    await refreshProjects();
    handleSetActiveProject(created);
    return created;
  };

  const updateProject = async (id: string, updates: Partial<Project>): Promise<Project> => {
    const updated = await projectService.updateProject(id, updates);
    await refreshProjects();
    if (activeProject?.id === id) {
      setActiveProject(updated);
    }
    return updated;
  };

  const archiveProject = async (id: string): Promise<void> => {
    await projectService.archiveProject(id);
    await refreshProjects();
  };

  const restoreProject = async (id: string): Promise<void> => {
    await projectService.restoreProject(id);
    await refreshProjects();
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeProject,
        isLoadingProjects,
        setActiveProject: handleSetActiveProject,
        setActiveProjectId,
        refreshProjects,
        createProject,
        updateProject,
        archiveProject,
        restoreProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
