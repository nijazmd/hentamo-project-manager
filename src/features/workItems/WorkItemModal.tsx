import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input, Textarea, Select } from '../../components/common/Input';
import {
  WorkItem,
  WorkItemType,
  Priority,
  Size,
  WorkItemStatus,
  BugSeverity,
  Version,
  FeatureGroup,
} from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';
import { workItemService } from '../../services/dbStore';
import { StatusWorkflow } from '../../components/workItems/StatusWorkflow';
import { SubtaskList } from '../../components/workItems/SubtaskList';
import { TestCaseManager } from '../../components/workItems/TestCaseManager';
import { DependencyManager } from '../../components/workItems/DependencyManager';
import { CommentSection } from '../../components/workItems/CommentSection';
import { ActivityHistorySection } from '../../components/workItems/ActivityHistorySection';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  Lightbulb,
  Sparkles,
  Wrench,
  CheckSquare,
  Bug,
  FlaskConical,
  Trash2,
  Paperclip,
  Star,
  ExternalLink,
} from 'lucide-react';
import { storageService } from '../../services/storageService';

interface WorkItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit?: WorkItem | null;
  defaultProjectId?: string;
  defaultVersionId?: string | null;
  defaultType?: WorkItemType;
  availableVersions: Version[];
  availableFeatureGroups: FeatureGroup[];
  allProjectItems?: WorkItem[];
  onItemUpdated: () => void;
}

export const WorkItemModal: React.FC<WorkItemModalProps> = ({
  isOpen,
  onClose,
  itemToEdit,
  defaultProjectId,
  defaultVersionId,
  defaultType = 'feature',
  availableVersions = [],
  availableFeatureGroups = [],
  allProjectItems = [],
  onItemUpdated,
}) => {
  const { user } = useAuth();
  const { activeProject } = useProject();

  const [projectId, setProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<WorkItemType>('feature');
  const [priority, setPriority] = useState<Priority>('P2');
  const [size, setSize] = useState<Size | ''>('M');
  const [status, setStatus] = useState<WorkItemStatus>('backlog');
  const [targetVersionId, setTargetVersionId] = useState<string>('');
  const [featureGroupId, setFeatureGroupId] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [labelsStr, setLabelsStr] = useState<string>('');
  const [isFocus, setIsFocus] = useState<boolean>(false);

  // Bug specific
  const [bugSeverity, setBugSeverity] = useState<BugSeverity>('major');
  const [stepsToReproduce, setStepsToReproduce] = useState('');
  const [expectedBehaviour, setExpectedBehaviour] = useState('');
  const [actualBehaviour, setActualBehaviour] = useState('');
  const [relatedWorkItemId, setRelatedWorkItemId] = useState('');

  // Subtasks and Test cases
  const [subtasks, setSubtasks] = useState<WorkItem['subtasks']>([]);
  const [testCases, setTestCases] = useState<WorkItem['testCases']>([]);
  const [attachments, setAttachments] = useState<WorkItem['attachments']>([]);

  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'testing' | 'links' | 'activity'>('details');

  useEffect(() => {
    if (itemToEdit) {
      setProjectId(itemToEdit.projectId);
      setTitle(itemToEdit.title);
      setDescription(itemToEdit.description);
      setType(itemToEdit.type);
      setPriority(itemToEdit.priority);
      setSize(itemToEdit.size || '');
      setStatus(itemToEdit.status);
      setTargetVersionId(itemToEdit.targetVersionId || '');
      setFeatureGroupId(itemToEdit.featureGroupId || '');
      setDueDate(itemToEdit.dueDate ? itemToEdit.dueDate.substring(0, 10) : '');
      setLabelsStr((itemToEdit.labels || []).join(', '));
      setIsFocus(itemToEdit.isFocus);

      setBugSeverity(itemToEdit.bugSeverity || 'major');
      setStepsToReproduce(itemToEdit.stepsToReproduce || '');
      setExpectedBehaviour(itemToEdit.expectedBehaviour || '');
      setActualBehaviour(itemToEdit.actualBehaviour || '');
      setRelatedWorkItemId(itemToEdit.relatedWorkItemId || '');

      setSubtasks(itemToEdit.subtasks || []);
      setTestCases(itemToEdit.testCases || []);
      setAttachments(itemToEdit.attachments || []);
    } else {
      setProjectId(defaultProjectId || activeProject?.id || '');
      setTitle('');
      setDescription('');
      setType(defaultType);
      setPriority(defaultType === 'bug' ? 'P1' : defaultType === 'idea' ? 'P3' : 'P2');
      setSize(defaultType === 'idea' ? '' : 'M');
      setStatus(defaultVersionId ? 'planned' : 'backlog');
      setTargetVersionId(defaultVersionId || '');
      setFeatureGroupId('');
      setDueDate('');
      setLabelsStr('');
      setIsFocus(false);

      setBugSeverity('major');
      setStepsToReproduce('');
      setExpectedBehaviour('');
      setActualBehaviour('');
      setRelatedWorkItemId('');

      setSubtasks([]);
      setTestCases([]);
      setAttachments([]);
    }
    setActiveTab('details');
  }, [itemToEdit, isOpen, defaultProjectId, defaultVersionId, defaultType, activeProject]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const att = await storageService.uploadAttachment(file);
      setAttachments(prev => [...prev, att]);
    } catch (err) {
      console.error('Failed to upload file:', err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !user || !projectId) return;

    setIsLoading(true);
    try {
      const labels = labelsStr
        .split(',')
        .map(l => l.trim())
        .filter(Boolean);

      const payload = {
        projectId,
        userId: user.uid,
        title: title.trim(),
        description: description.trim(),
        type,
        priority,
        size: (size as Size) || null,
        status,
        targetVersionId: targetVersionId || null,
        featureGroupId: featureGroupId || null,
        labels,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        isFocus,
        subtasks,
        testCases,
        attachments,
        bugSeverity: type === 'bug' ? bugSeverity : null,
        stepsToReproduce: type === 'bug' ? stepsToReproduce.trim() : null,
        expectedBehaviour: type === 'bug' ? expectedBehaviour.trim() : null,
        actualBehaviour: type === 'bug' ? actualBehaviour.trim() : null,
        relatedWorkItemId: type === 'bug' && relatedWorkItemId ? relatedWorkItemId : null,
      };

      if (itemToEdit) {
        await workItemService.updateWorkItem(itemToEdit.id, payload);
      } else {
        await workItemService.createWorkItem({
          ...payload,
          isDeleted: false,
          dependencies: [],
          testHistory: [],
          createdBy: user.displayName || 'Solo Developer',
        });
      }

      onItemUpdated();
      onClose();
    } catch (err) {
      console.error('Failed to save work item:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchiveConfirm = async (reason?: string) => {
    if (!itemToEdit) return;
    try {
      await workItemService.archiveWorkItem(itemToEdit.id, reason);
      setIsArchiveConfirmOpen(false);
      onItemUpdated();
      onClose();
    } catch (err) {
      console.error('Failed to archive item:', err);
    }
  };

  const TYPE_BUTTONS: { type: WorkItemType; label: string; icon: any }[] = [
    { type: 'idea', label: 'Idea', icon: Lightbulb },
    { type: 'feature', label: 'Feature', icon: Sparkles },
    { type: 'improvement', label: 'Improvement', icon: Wrench },
    { type: 'task', label: 'Task', icon: CheckSquare },
    { type: 'bug', label: 'Bug', icon: Bug },
    { type: 'test', label: 'Test', icon: FlaskConical },
  ];

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={
          <div className="flex items-center gap-2">
            <span>{itemToEdit ? `Edit Work Item: ${itemToEdit.title}` : 'New Work Item'}</span>
            {itemToEdit && (
              <button
                type="button"
                onClick={() => setIsFocus(!isFocus)}
                className={`p-1 rounded transition-colors ${
                  isFocus ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
                }`}
                title={isFocus ? 'Focus active' : 'Mark as focus'}
              >
                <Star size={16} className={isFocus ? 'fill-amber-400' : ''} />
              </button>
            )}
          </div>
        }
        subtitle="Manage planning, specifications, subtasks, dependencies and testing"
        maxWidth="3xl"
      >
        {/* Status Workflow Pipeline bar (when editing existing item) */}
        {itemToEdit && (
          <div className="mb-4">
            <StatusWorkflow
              item={itemToEdit}
              availableVersions={availableVersions}
              onStatusChange={async newStatus => {
                await workItemService.updateWorkItemStatus(itemToEdit.id, newStatus);
                setStatus(newStatus);
                onItemUpdated();
              }}
              onRecordTestOutcome={async (result, notes, action, futVerId) => {
                await workItemService.recordTestAttempt(itemToEdit.id, result, notes, {
                  action,
                  futureVersionId: futVerId,
                });
                onItemUpdated();
              }}
            />
          </div>
        )}

        {/* Tab Navigation for Edit Mode */}
        {itemToEdit && (
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-4 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'details'
                  ? 'bg-slate-800 text-sky-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Details & Subtasks
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('testing')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'testing'
                  ? 'bg-slate-800 text-purple-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Test Cases ({testCases.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('links')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'links'
                  ? 'bg-slate-800 text-sky-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dependencies ({(itemToEdit.dependencies || []).length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('activity')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'activity'
                  ? 'bg-slate-800 text-slate-200 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Comments & History
            </button>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {activeTab === 'details' && (
            <>
              {/* Type Switcher */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Item Type
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {TYPE_BUTTONS.map(t => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.type}
                        type="button"
                        onClick={() => setType(t.type)}
                        className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                          type === t.type
                            ? 'bg-slate-800 text-white border-sky-500 ring-1 ring-sky-500/50'
                            : 'bg-[#0B0F17] text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <Icon size={13} />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <Input
                label="Title"
                placeholder="What needs to be done or solved?"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                autoFocus
              />

              {/* Description */}
              <Textarea
                label="Description & Specifications"
                placeholder="Detailed scope, context, notes..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
              />

              {/* Bug Specific Section */}
              {type === 'bug' && (
                <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                      <Bug size={14} /> Bug Diagnostics & Reproduction
                    </span>
                    <div className="w-36">
                      <Select
                        value={bugSeverity}
                        onChange={e => setBugSeverity(e.target.value as BugSeverity)}
                      >
                        <option value="blocker">Blocker</option>
                        <option value="critical">Critical</option>
                        <option value="major">Major</option>
                        <option value="minor">Minor</option>
                        <option value="trivial">Trivial</option>
                      </Select>
                    </div>
                  </div>

                  <Textarea
                    label="Steps to Reproduce"
                    placeholder="1. Open screen... 2. Click button... 3. See error..."
                    value={stepsToReproduce}
                    onChange={e => setStepsToReproduce(e.target.value)}
                    rows={2}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Textarea
                      label="Expected Behaviour"
                      placeholder="What should happen..."
                      value={expectedBehaviour}
                      onChange={e => setExpectedBehaviour(e.target.value)}
                      rows={2}
                    />
                    <Textarea
                      label="Actual Behaviour"
                      placeholder="What actually happens..."
                      value={actualBehaviour}
                      onChange={e => setActualBehaviour(e.target.value)}
                      rows={2}
                    />
                  </div>

                  {/* Related Work Item link (e.g. Feature) */}
                  <Select
                    label="Related Feature / Work Item"
                    value={relatedWorkItemId}
                    onChange={e => setRelatedWorkItemId(e.target.value)}
                  >
                    <option value="">-- None / Standalone Bug --</option>
                    {allProjectItems
                      .filter(i => i.id !== itemToEdit?.id && !i.isDeleted)
                      .map(i => (
                        <option key={i.id} value={i.id}>
                          [{i.type.toUpperCase()}] {i.title}
                        </option>
                      ))}
                  </Select>
                </div>
              )}

              {/* Planning Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Select
                  label="Priority"
                  value={priority}
                  onChange={e => setPriority(e.target.value as Priority)}
                >
                  <option value="P0">P0 — Critical</option>
                  <option value="P1">P1 — High</option>
                  <option value="P2">P2 — Medium</option>
                  <option value="P3">P3 — Low</option>
                </Select>

                <Select
                  label="Size Estimate"
                  value={size}
                  onChange={e => setSize(e.target.value as Size)}
                >
                  <option value="">None</option>
                  <option value="XXS">XXS (Few mins)</option>
                  <option value="XS">XS (&lt; 1 hr)</option>
                  <option value="S">S (Few hrs)</option>
                  <option value="M">M (~1 day)</option>
                  <option value="L">L (2-3 days)</option>
                  <option value="XL">XL (Up to 1 wk)</option>
                  <option value="XXL">XXL (Large/Complex)</option>
                </Select>

                <Select
                  label="Target Version"
                  value={targetVersionId}
                  onChange={e => setTargetVersionId(e.target.value)}
                >
                  <option value="">Backlog (Unassigned)</option>
                  {availableVersions.map(v => (
                    <option key={v.id} value={v.id}>
                      v{v.versionNumber} ({v.title.substring(0, 20)})
                    </option>
                  ))}
                </Select>

                <Select
                  label="Feature Group"
                  value={featureGroupId}
                  onChange={e => setFeatureGroupId(e.target.value)}
                >
                  <option value="">None</option>
                  {availableFeatureGroups.map(fg => (
                    <option key={fg.id} value={fg.id}>
                      {fg.name}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Due Date & Labels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Due Date"
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                />

                <Input
                  label="Labels / Tags (comma-separated)"
                  placeholder="e.g. database, api, core"
                  value={labelsStr}
                  onChange={e => setLabelsStr(e.target.value)}
                />
              </div>

              {/* Subtasks Section */}
              <div className="pt-2 border-t border-slate-800">
                <SubtaskList subtasks={subtasks} onChange={setSubtasks} />
              </div>

              {/* Attachments Section */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Paperclip size={14} /> Attachments & Screenshots ({attachments.length})
                  </span>
                  <label className="text-xs text-sky-400 hover:text-sky-300 cursor-pointer font-medium">
                    + Upload File
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      accept="image/*,.pdf,.txt"
                    />
                  </label>
                </div>

                <div className="flex flex-wrap gap-2">
                  {attachments.map(att => (
                    <div
                      key={att.id}
                      className="flex items-center gap-2 p-1.5 px-2 rounded-lg bg-[#0B0F17] border border-slate-800 text-xs"
                    >
                      <a
                        href={att.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sky-400 hover:underline truncate max-w-[150px]"
                      >
                        {att.name}
                      </a>
                      <button
                        type="button"
                        onClick={() =>
                          setAttachments(attachments.filter(a => a.id !== att.id))
                        }
                        className="text-slate-500 hover:text-rose-400"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'testing' && (
            <div className="space-y-4">
              <TestCaseManager testCases={testCases} onChange={setTestCases} />

              {/* Test History Audit */}
              {itemToEdit?.testHistory && itemToEdit.testHistory.length > 0 && (
                <div className="pt-3 border-t border-slate-800">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Test History Audit
                  </h4>
                  <div className="space-y-2">
                    {itemToEdit.testHistory.map((att, idx) => (
                      <div
                        key={att.id || idx}
                        className="p-2.5 rounded-lg bg-[#0B0F17] border border-slate-800 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-semibold font-mono ${
                              att.result === 'passed' ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            Attempt: {att.result.toUpperCase()}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(att.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-300">{att.notes}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'links' && itemToEdit && (
            <DependencyManager
              item={itemToEdit}
              allProjectItems={allProjectItems}
              onDependencyChanged={onItemUpdated}
            />
          )}

          {activeTab === 'activity' && itemToEdit && (
            <div className="space-y-6">
              <CommentSection workItemId={itemToEdit.id} />
              <div className="border-t border-slate-800 pt-3">
                <ActivityHistorySection workItemId={itemToEdit.id} />
              </div>
            </div>
          )}

          {/* Footer Save & Archive Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            {itemToEdit ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-rose-400 hover:bg-rose-950/40 hover:text-rose-300"
                onClick={() => setIsArchiveConfirmOpen(true)}
                leftIcon={<Trash2 size={14} />}
              >
                Archive Item
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isLoading}
                disabled={!title.trim()}
              >
                {itemToEdit ? 'Save Changes' : 'Create Work Item'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog for Archiving Item */}
      {itemToEdit && (
        <ConfirmDialog
          isOpen={isArchiveConfirmOpen}
          onClose={() => setIsArchiveConfirmOpen(false)}
          onConfirm={handleArchiveConfirm}
          title="Delete Work Item?"
          message="This item will be moved to the Deleted Archive. You can restore it anytime."
          confirmText="Archive Item"
          cancelText="Cancel"
          variant="danger"
          showReasonInput
          reasonPlaceholder="e.g. Obsolete requirement or duplicate item"
        />
      )}
    </>
  );
};
