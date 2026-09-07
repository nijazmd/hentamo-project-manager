import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input, Textarea, Select } from '../../components/common/Input';
import { Version, VersionStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { versionService } from '../../services/dbStore';

interface VersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  versionToEdit?: Version | null;
  onVersionSaved: () => void;
}

export const VersionModal: React.FC<VersionModalProps> = ({
  isOpen,
  onClose,
  projectId,
  versionToEdit,
  onVersionSaved,
}) => {
  const { user } = useAuth();
  const [versionNumber, setVersionNumber] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<VersionStatus>('planning');
  const [targetDate, setTargetDate] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (versionToEdit) {
      setVersionNumber(versionToEdit.versionNumber);
      setTitle(versionToEdit.title);
      setDescription(versionToEdit.description);
      setStatus(versionToEdit.status);
      setTargetDate(versionToEdit.targetDate ? versionToEdit.targetDate.substring(0, 10) : '');
      setReleaseDate(versionToEdit.releaseDate ? versionToEdit.releaseDate.substring(0, 10) : '');
      setNotes(versionToEdit.notes || '');
    } else {
      setVersionNumber('');
      setTitle('');
      setDescription('');
      setStatus('planning');
      setTargetDate('');
      setReleaseDate('');
      setNotes('');
    }
  }, [versionToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!versionNumber.trim() || !user || !projectId) return;

    setIsLoading(true);
    try {
      const payload = {
        projectId,
        userId: user.uid,
        versionNumber: versionNumber.trim(),
        title: title.trim(),
        description: description.trim(),
        status,
        targetDate: targetDate ? new Date(targetDate).toISOString() : null,
        releaseDate: releaseDate ? new Date(releaseDate).toISOString() : null,
        notes: notes.trim(),
      };

      if (versionToEdit) {
        await versionService.updateVersion(versionToEdit.id, payload);
      } else {
        await versionService.createVersion(payload);
      }

      onVersionSaved();
      onClose();
    } catch (err) {
      console.error('Failed to save version:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={versionToEdit ? `Edit Version: v${versionToEdit.versionNumber}` : 'Create New Version'}
      subtitle="Define release milestones, target dates, and scope"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Version Number"
            placeholder="e.g. 1.3.0"
            value={versionNumber}
            onChange={e => setVersionNumber(e.target.value)}
            required
            autoFocus
          />

          <div className="col-span-2">
            <Select
              label="Version Status"
              value={status}
              onChange={e => setStatus(e.target.value as VersionStatus)}
            >
              <option value="planning">📝 Planning</option>
              <option value="development">⚙️ Development</option>
              <option value="testing">🧪 Testing</option>
              <option value="released">🚀 Released</option>
              <option value="archived">📦 Archived</option>
            </Select>
          </div>
        </div>

        <Input
          label="Version Title"
          placeholder="e.g. Championship Cups & Standings Engine"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />

        <Textarea
          label="Release Goal / Description"
          placeholder="What is the objective of this release?"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={2}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Target Date"
            type="date"
            value={targetDate}
            onChange={e => setTargetDate(e.target.value)}
          />

          <Input
            label="Release Date"
            type="date"
            value={releaseDate}
            onChange={e => setReleaseDate(e.target.value)}
          />
        </div>

        <Textarea
          label="Notes (Optional)"
          placeholder="Retrospective or release notes..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
        />

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800/80">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isLoading}
            disabled={!versionNumber.trim() || !title.trim()}
          >
            {versionToEdit ? 'Save Changes' : 'Create Version'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
