import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input, Textarea } from '../../components/common/Input';
import { FeatureGroup } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { featureGroupService } from '../../services/dbStore';

interface FeatureGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  groupToEdit?: FeatureGroup | null;
  onSaved: () => void;
}

const PRESET_COLORS = [
  '#38BDF8',
  '#A855F7',
  '#34D399',
  '#F59E0B',
  '#F43F5E',
  '#6366F1',
];

export const FeatureGroupModal: React.FC<FeatureGroupModalProps> = ({
  isOpen,
  onClose,
  projectId,
  groupToEdit,
  onSaved,
}) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (groupToEdit) {
      setName(groupToEdit.name);
      setDescription(groupToEdit.description);
      setColor(groupToEdit.color || PRESET_COLORS[0]);
    } else {
      setName('');
      setDescription('');
      setColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
    }
  }, [groupToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !user || !projectId) return;

    setIsLoading(true);
    try {
      if (groupToEdit) {
        await featureGroupService.updateFeatureGroup(groupToEdit.id, {
          name: name.trim(),
          description: description.trim(),
          color,
        });
      } else {
        await featureGroupService.createFeatureGroup({
          projectId,
          userId: user.uid,
          name: name.trim(),
          description: description.trim(),
          color,
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error('Failed to save feature group:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={groupToEdit ? `Edit Feature Group: ${groupToEdit.name}` : 'New Feature Group'}
      subtitle="High-level grouping independent of releases (e.g. Championship System, Wallet)"
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Group Name"
          placeholder="e.g. Championship System, Statistics"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          autoFocus
        />

        <Textarea
          label="Scope / Description"
          placeholder="What features belong in this group?"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={2}
        />

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Color Tag
          </label>
          <div className="flex items-center gap-2 h-10 px-3 rounded-lg bg-[#0B0F17] border border-slate-800">
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-5 h-5 rounded-full transition-transform cursor-pointer ${
                  color === c ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
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
            {groupToEdit ? 'Save Changes' : 'Create Group'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
