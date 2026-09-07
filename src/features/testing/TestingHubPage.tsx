import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProject } from '../../context/ProjectContext';
import { workItemService, versionService, testReportService } from '../../services/dbStore';
import { WorkItem, Version, TestReport } from '../../types';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { WorkItemCard } from '../../components/workItems/WorkItemCard';
import { WorkItemModal } from '../workItems/WorkItemModal';
import { TestReportModal } from './TestReportModal';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDate } from '../../utils/dateUtils';
import {
  FlaskConical,
  Plus,
  FileCheck,
  Smartphone,
  Globe,
  CheckCircle2,
  XCircle,
  Calendar,
} from 'lucide-react';

export const TestingHubPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { activeProject } = useProject();
  const currentProjId = projectId || activeProject?.id;

  const [testingItems, setTestingItems] = useState<WorkItem[]>([]);
  const [allItems, setAllItems] = useState<WorkItem[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);
  const [reports, setReports] = useState<TestReport[]>([]);
  const [selectedItem, setSelectedItem] = useState<WorkItem | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'workItems' | 'reports'>('workItems');
  const [isLoading, setIsLoading] = useState(true);

  const loadTestingData = async () => {
    if (!currentProjId) return;
    try {
      setIsLoading(true);
      const [itemsData, versionsData, reportsData] = await Promise.all([
        workItemService.getWorkItems(currentProjId),
        versionService.getVersions(currentProjId),
        testReportService.getTestReports(currentProjId),
      ]);
      setAllItems(itemsData.filter(i => !i.isDeleted));
      setTestingItems(itemsData.filter(i => i.status === 'testing' && !i.isDeleted));
      setVersions(versionsData);
      setReports(reportsData);
    } catch (err) {
      console.error('Failed to load testing data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTestingData();
  }, [currentProjId]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <FlaskConical size={20} className="text-purple-400" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Testing Hub & Quality Gate
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-purple-950/60 text-purple-400 border border-purple-800/60 font-semibold">
              {testingItems.length} awaiting QA
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Enforce verification workflows before items can become Completed. Log device test reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsReportModalOpen(true)}
            leftIcon={<FileCheck size={14} />}
          >
            New Test Report
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-medium">
        <button
          onClick={() => setActiveTab('workItems')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'workItems'
              ? 'bg-slate-800 text-purple-400 font-semibold border border-purple-800/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Items in Testing ({testingItems.length})
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'reports'
              ? 'bg-slate-800 text-purple-400 font-semibold border border-purple-800/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Version Test Reports ({reports.length})
        </button>
      </div>

      {/* Tab 1: Work Items Currently in Testing */}
      {activeTab === 'workItems' && (
        <div>
          {testingItems.length === 0 ? (
            <EmptyState
              icon={<FlaskConical size={28} className="text-purple-400" />}
              title="No items in testing"
              description="When development work completes on a work item, move it to Testing to verify and approve."
            />
          ) : (
            <div className="space-y-3">
              {testingItems.map(item => (
                <div key={item.id} className="space-y-2">
                  <WorkItemCard
                    item={item}
                    version={versions.find(v => v.id === item.targetVersionId)}
                    onClick={() => {
                      setSelectedItem(item);
                      setIsItemModalOpen(true);
                    }}
                    onToggleFocus={async e => {
                      e.stopPropagation();
                      await workItemService.toggleFocus(item.id);
                      loadTestingData();
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Version Test Reports */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <EmptyState
              icon={<FileCheck size={28} className="text-purple-400" />}
              title="No test reports recorded yet."
              description="Record regression or device test runs with pass/fail counts and observations."
              actionText="Create Test Report"
              onAction={() => setIsReportModalOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reports.map(rep => {
                const repVersion = versions.find(v => v.id === rep.versionId);
                return (
                  <Card key={rep.id} className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-white">
                          {rep.title}
                        </h3>
                        {repVersion && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-indigo-400 mt-1">
                            Release: v{repVersion.versionNumber}
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                        <Calendar size={11} />
                        {formatDate(rep.date)}
                      </span>
                    </div>

                    {/* Environment Pills */}
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-300 flex-wrap">
                      <span className="px-2 py-0.5 rounded bg-[#0B0F17] border border-slate-800 flex items-center gap-1">
                        <Smartphone size={12} className="text-sky-400" />
                        {rep.platform} ({rep.device})
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#0B0F17] border border-slate-800 flex items-center gap-1">
                        <Globe size={12} className="text-emerald-400" />
                        {rep.browser}
                      </span>
                    </div>

                    {/* Pass/Fail count badges */}
                    <div className="flex items-center gap-3 pt-2 border-t border-slate-800 font-mono text-xs">
                      <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 size={13} /> {rep.passedCount} Passed
                      </span>
                      <span className="text-rose-400 flex items-center gap-1 font-semibold">
                        <XCircle size={13} /> {rep.failedCount} Failed
                      </span>
                    </div>

                    {/* Notes */}
                    {rep.notes && (
                      <p className="text-xs text-slate-400 bg-[#0B0F17] p-2.5 rounded-lg border border-slate-800/80 leading-relaxed">
                        {rep.notes}
                      </p>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
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
          availableFeatureGroups={[]}
          allProjectItems={allItems}
          onItemUpdated={loadTestingData}
        />
      )}

      {/* Test Report Modal */}
      {currentProjId && (
        <TestReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          projectId={currentProjId}
          availableVersions={versions}
          onReportSaved={loadTestingData}
        />
      )}
    </div>
  );
};
