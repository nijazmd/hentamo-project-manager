import React, { useState } from 'react';
import { WorkItem, Dependency, DependencyType } from '../../types';
import { Button } from '../common/Button';
import { Select } from '../common/Input';
import { Link2, Plus, Trash2, Lock, AlertCircle, Copy } from 'lucide-react';
import { workItemService } from '../../services/dbStore';

interface DependencyManagerProps {
  item: WorkItem;
  allProjectItems: WorkItem[];
  onDependencyChanged: () => void;
}

export const DependencyManager: React.FC<DependencyManagerProps> = ({
  item,
  allProjectItems,
  onDependencyChanged,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [targetId, setTargetId] = useState('');
  const [depType, setDepType] = useState<DependencyType>('blocks');
  const [isLoading, setIsLoading] = useState(false);

  // Exclude current item and items already linked
  const linkedIds = new Set((item.dependencies || []).map(d => d.targetItemId));
  linkedIds.add(item.id);
  const availableTargetItems = allProjectItems.filter(i => !linkedIds.has(i.id) && !i.isDeleted);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetId) return;

    setIsLoading(true);
    try {
      await workItemService.addDependency(item.id, targetId, depType as any);
      onDependencyChanged();
      setIsAdding(false);
      setTargetId('');
    } catch (err) {
      console.error('Failed to link dependency:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (targetItemId: string) => {
    try {
      await workItemService.removeDependency(item.id, targetItemId);
      onDependencyChanged();
    } catch (err) {
      console.error('Failed to remove dependency:', err);
    }
  };

  const getDependencyBadge = (type: Dependency['type']) => {
    switch (type) {
      case 'blocks':
        return (
          <span className="text-[11px] font-mono font-medium text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded flex items-center gap-1">
            <Lock size={11} /> Blocks
          </span>
        );
      case 'is_blocked_by':
        return (
          <span className="text-[11px] font-mono font-medium text-rose-400 bg-rose-950/50 border border-rose-700/60 px-2 py-0.5 rounded flex items-center gap-1 animate-pulse">
            <Lock size={11} /> Blocked By
          </span>
        );
      case 'duplicate':
        return (
          <span className="text-[11px] font-mono font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded flex items-center gap-1">
            <Copy size={11} /> Duplicate
          </span>
        );
      case 'related':
      default:
        return (
          <span className="text-[11px] font-mono font-medium text-sky-400 bg-sky-950/40 border border-sky-800/40 px-2 py-0.5 rounded flex items-center gap-1">
            <Link2 size={11} /> Related
          </span>
        );
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link2 size={16} className="text-sky-400" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Dependencies & Relationships
          </h4>
        </div>
        {(item.dependencies || []).length > 0 && (
          <span className="text-xs font-mono text-slate-500">
            {item.dependencies.length} linked
          </span>
        )}
      </div>

      {/* Dependencies List */}
      <div className="space-y-1.5">
        {(item.dependencies || []).length === 0 ? (
          <p className="text-xs text-slate-500 italic py-1">
            No dependencies linked. This item has no blockers.
          </p>
        ) : (
          item.dependencies.map(dep => (
            <div
              key={dep.id}
              className="flex items-center justify-between p-2.5 rounded-lg bg-[#0B0F17] border border-slate-800/80 hover:border-slate-700/80 transition-colors group"
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                {getDependencyBadge(dep.type)}
                <span className="text-xs font-medium text-slate-200 truncate">
                  {dep.targetTitle}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleRemove(dep.targetItemId)}
                className="text-slate-600 hover:text-rose-400 p-1.5 rounded opacity-0 group-hover:opacity-100 transition-all cursor-pointer shrink-0"
                title="Unlink dependency"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add Dependency Form */}
      {isAdding ? (
        <form onSubmit={handleAdd} className="p-3 rounded-xl bg-[#0B0F17] border border-slate-800 space-y-2.5">
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-1">
              <Select
                label="Relationship"
                value={depType}
                onChange={e => setDepType(e.target.value as DependencyType)}
              >
                <option value="blocks">Blocks</option>
                <option value="related">Related to</option>
                <option value="duplicate">Duplicates</option>
              </Select>
            </div>

            <div className="col-span-2">
              <Select
                label="Target Work Item"
                value={targetId}
                onChange={e => setTargetId(e.target.value)}
                required
              >
                <option value="">-- Choose work item --</option>
                {availableTargetItems.map(ti => (
                  <option key={ti.id} value={ti.id}>
                    [{ti.type.toUpperCase()}] {ti.title}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => setIsAdding(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="xs"
              isLoading={isLoading}
              disabled={!targetId}
            >
              Link Item
            </Button>
          </div>
        </form>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={() => setIsAdding(true)}
          leftIcon={<Plus size={13} />}
          className="w-full"
          disabled={availableTargetItems.length === 0}
        >
          {availableTargetItems.length === 0 ? 'No other items to link' : 'Add Dependency'}
        </Button>
      )}
    </div>
  );
};
