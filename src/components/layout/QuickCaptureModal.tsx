import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input, Select, Textarea } from '../common/Input';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { workItemService } from '../../services/dbStore';
import { WorkItemType, Priority } from '../../types';
import { Lightbulb, Sparkles, CheckSquare, Bug } from 'lucide-react';

interface QuickCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemCreated?: () => void;
}

export const QuickCaptureModal: React.FC<QuickCaptureModalProps> = ({
  isOpen,
  onClose,
  onItemCreated,
}) => {
  const { projects, activeProject } = useProject();
  const { user } = useAuth();

  const [projectId, setProjectId] = useState('');
  const [type, setType] = useState<WorkItemType>('idea');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('P2');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setProjectId(activeProject?.id || (projects[0]?.id || ''));
      setType('idea');
      setTitle('');
      setDescription('');
      setPriority('P2');
    }
  }, [isOpen, activeProject, projects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !projectId || !user) return;

    setIsLoading(true);
    try {
      await workItemService.createWorkItem({
        projectId,
        userId: user.uid,
        title: title.trim(),
        description: description.trim(),
        type,
        priority: type === 'idea' ? 'P3' : priority,
        size: null,
        status: 'backlog', // Backlog by default
        targetVersionId: null,
        featureGroupId: null,
        labels: [type],
        dueDate: null,
        isFocus: false,
        subtasks: [],
        dependencies: [],
        testCases: [],
        testHistory: [],
        attachments: [],
        createdBy: user.displayName || 'Solo Developer',
        isDeleted: false,
      });

      onClose();
      if (onItemCreated) onItemCreated();
    } catch (err) {
      console.error('Failed to create quick item:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const typeButtons: { type: WorkItemType; label: string; icon: React.ReactNode }[] = [
    { type: 'idea', label: 'Idea', icon: <Lightbulb size={14} className="text-purple-400" /> },
    { type: 'feature', label: 'Feature', icon: <Sparkles size={14} className="text-sky-400" /> },
    { type: 'task', label: 'Task', icon: <CheckSquare size={14} className="text-blue-400" /> },
    { type: 'bug', label: 'Bug', icon: <Bug size={14} className="text-rose-400" /> },
  ];

  const activeProjects = projects.filter(p => p.status !== 'archived');

  if (activeProjects.length === 0) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Quick Capture"
        subtitle="Rapidly capture an idea, task or bug"
        maxWidth="md"
      >
        <div className="text-center py-6 space-y-3">
          <p className="text-sm text-slate-300">
            You don't have any active projects yet.
          </p>
          <p className="text-xs text-slate-500">
            Create your first project before capturing backlog items.
          </p>
          <div className="pt-2">
            <Button
              size="sm"
              variant="primary"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quick Capture"
      subtitle="Rapidly capture an idea, task or bug directly to the backlog"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Capture Type
          </label>
          <div className="grid grid-cols-4 gap-2">
            {typeButtons.map(item => (
              <button
                key={item.type}
                type="button"
                onClick={() => setType(item.type)}
                className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  type === item.type
                    ? 'bg-slate-800 text-white border-sky-500 ring-1 ring-sky-500/50'
                    : 'bg-[#0B0F17] text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Project Selector */}
        <Select
          label="Project"
          value={projectId}
          onChange={e => setProjectId(e.target.value)}
          required
        >
          {projects
            .filter(p => p.status !== 'archived')
            .map(p => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.description.substring(0, 40)}...
              </option>
            ))}
        </Select>

        {/* Title */}
        <Input
          label="Title"
          placeholder={
            type === 'idea'
              ? 'e.g. Add championship history archive'
              : type === 'bug'
              ? 'e.g. Standings calculation fails on tied race'
              : 'e.g. Build cups tournament brackets'
          }
          value={title}
          onChange={e => setTitle(e.target.value)}
          autoFocus
          required
        />

        {/* Notes (Optional) */}
        <Textarea
          label="Quick Notes (Optional)"
          placeholder="Add context, thought or reproduction details..."
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={2}
        />

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
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
            Save to Backlog
          </Button>
        </div>
      </form>
    </Modal>
  );
};
