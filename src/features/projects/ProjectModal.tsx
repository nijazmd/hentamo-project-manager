import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input, Textarea, Select } from '../../components/common/Input';
import { Project, ProjectStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectToEdit?: Project | null;
}

const COLOR_PRESETS = [
  '#38BDF8', // Sky
  '#34D399', // Emerald
  '#F59E0B', // Amber
  '#A855F7', // Purple
  '#F43F5E', // Rose
  '#6366F1', // Indigo
  '#06B6D4', // Cyan
];

const PLATFORM_OPTIONS = ['Web', 'iOS', 'Android', 'PWA', 'macOS'];

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  projectToEdit,
}) => {
  const { user } = useAuth();
  const { createProject, updateProject } = useProject();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLOR_PRESETS[0]);
  const [status, setStatus] = useState<ProjectStatus>('active');
  const [platforms, setPlatforms] = useState<string[]>(['Web']);
  const [repoUrl, setRepoUrl] = useState('');
  const [prodUrl, setProdUrl] = useState('');
  const [currentVersion, setCurrentVersion] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (projectToEdit) {
      setName(projectToEdit.name);
      setDescription(projectToEdit.description);
      setColor(projectToEdit.color || COLOR_PRESETS[0]);
      setStatus(projectToEdit.status);
      setPlatforms(projectToEdit.platform || ['Web']);
      setRepoUrl(projectToEdit.repoUrl || '');
      setProdUrl(projectToEdit.prodUrl || '');
      setCurrentVersion(projectToEdit.currentVersion || '');
    } else {
      setName('');
      setDescription('');
      setColor(COLOR_PRESETS[Math.floor(Math.random() * COLOR_PRESETS.length)]);
      setStatus('active');
      setPlatforms(['Web']);
      setRepoUrl('');
      setProdUrl('');
      setCurrentVersion('');
    }
  }, [projectToEdit, isOpen]);

  const togglePlatform = (p: string) => {
    setPlatforms(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !user) return;

    setIsLoading(true);
    try {
      if (projectToEdit) {
        await updateProject(projectToEdit.id, {
          name: name.trim(),
          description: description.trim(),
          color,
          status,
          platform: platforms,
          repoUrl: repoUrl.trim() || null,
          prodUrl: prodUrl.trim() || null,
          currentVersion: currentVersion.trim() || null,
        });
      } else {
        await createProject({
          userId: user.uid,
          name: name.trim(),
          description: description.trim(),
          color,
          status,
          platform: platforms,
          repoUrl: repoUrl.trim() || null,
          prodUrl: prodUrl.trim() || null,
          currentVersion: currentVersion.trim() || null,
          icon: 'FolderKanban',
        });
      }
      onClose();
    } catch (err) {
      console.error('Failed to save project:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={projectToEdit ? `Edit Project: ${projectToEdit.name}` : 'Create New Project'}
      subtitle="Manage standalone application repository, platforms, and release metadata"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Input
              label="Project Name"
              placeholder="e.g. ARL, AHL, ATrL"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="w-28">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Color
            </label>
            <div className="flex items-center gap-1.5 h-10 px-2 rounded-lg bg-[#0B0F17] border border-slate-800">
              {COLOR_PRESETS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-4 h-4 rounded-full transition-transform cursor-pointer ${
                    color === c ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        <Textarea
          label="Description"
          placeholder="What does this application do? Core goals & scope..."
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={2}
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Project Status"
            value={status}
            onChange={e => setStatus(e.target.value as ProjectStatus)}
          >
            <option value="active">Active</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </Select>

          <Input
            label="Current Version"
            placeholder="e.g. 1.0.0"
            value={currentVersion}
            onChange={e => setCurrentVersion(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Target Platforms
          </label>
          <div className="flex flex-wrap gap-2">
            {PLATFORM_OPTIONS.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => togglePlatform(p)}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  platforms.includes(p)
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/60'
                    : 'bg-[#0B0F17] text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Repository URL (Optional)"
            placeholder="https://github.com/..."
            value={repoUrl}
            onChange={e => setRepoUrl(e.target.value)}
          />

          <Input
            label="Production URL (Optional)"
            placeholder="https://..."
            value={prodUrl}
            onChange={e => setProdUrl(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800/80">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isLoading}
            disabled={!name.trim()}
          >
            {projectToEdit ? 'Save Changes' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
