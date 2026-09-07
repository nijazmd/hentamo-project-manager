import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AppLayout } from '../components/layout/AppLayout';
import { LoginPage } from '../features/auth/LoginPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { ProjectListPage } from '../features/projects/ProjectListPage';
import { ProjectDetailPage } from '../features/projects/ProjectDetailPage';
import { BacklogPage } from '../features/backlog/BacklogPage';
import { VersionListPage } from '../features/versions/VersionListPage';
import { VersionDetailPage } from '../features/versions/VersionDetailPage';
import { AllItemsPage } from '../features/workItems/AllItemsPage';
import { TestingHubPage } from '../features/testing/TestingHubPage';
import { FeatureGroupsPage } from '../features/featureGroups/FeatureGroupsPage';
import { ArchivePage } from '../features/archive/ArchivePage';
import { MyFocusPage } from '../features/dashboard/MyFocusPage';

export const AppRoutes: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white animate-pulse">
            H
          </div>
          <span className="text-xs font-mono text-slate-400">Loading Hentamo workspace...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        {/* Command Center */}
        <Route index element={<DashboardPage />} />
        <Route path="projects" element={<ProjectListPage />} />
        <Route path="focus" element={<MyFocusPage />} />
        <Route path="archive" element={<ArchivePage />} />

        {/* Project Specific Modules */}
        <Route path="projects/:projectId/overview" element={<ProjectDetailPage />} />
        <Route path="projects/:projectId/backlog" element={<BacklogPage />} />
        <Route path="projects/:projectId/versions" element={<VersionListPage />} />
        <Route path="projects/:projectId/versions/:versionId" element={<VersionDetailPage />} />
        <Route path="projects/:projectId/items" element={<AllItemsPage />} />
        <Route path="projects/:projectId/testing" element={<TestingHubPage />} />
        <Route path="projects/:projectId/feature-groups" element={<FeatureGroupsPage />} />
        <Route path="projects/:projectId/archive" element={<ArchivePage />} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
