import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { DesktopSidebar } from './DesktopSidebar';
import { MobileNav } from './MobileNav';
import { QuickCaptureModal } from './QuickCaptureModal';
import { ProjectModal } from '../../features/projects/ProjectModal';

export const AppLayout: React.FC = () => {
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  // Global keyboard shortcut: Cmd+K or Ctrl+K opens Quick Capture
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsQuickCaptureOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0B0F17] text-slate-100">
      {/* Desktop Command Sidebar */}
      <DesktopSidebar
        onOpenQuickCapture={() => setIsQuickCaptureOpen(true)}
        onOpenNewProject={() => setIsNewProjectModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0 overflow-y-auto min-h-screen">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav onOpenQuickCapture={() => setIsQuickCaptureOpen(true)} />

      {/* Quick Capture Modal */}
      <QuickCaptureModal
        isOpen={isQuickCaptureOpen}
        onClose={() => setIsQuickCaptureOpen(false)}
        onItemCreated={() => {
          // Trigger refresh event if needed
          window.dispatchEvent(new Event('hentamo:refresh-items'));
        }}
      />

      {/* New Project Modal */}
      <ProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
      />
    </div>
  );
};
