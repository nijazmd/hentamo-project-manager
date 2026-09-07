import React, { useState } from 'react';
import { Subtask } from '../../types';
import { Button } from '../common/Button';
import { Plus, Check, Trash2, CheckSquare } from 'lucide-react';

interface SubtaskListProps {
  subtasks: Subtask[];
  onChange: (updatedSubtasks: Subtask[]) => void;
}

export const SubtaskList: React.FC<SubtaskListProps> = ({ subtasks = [], onChange }) => {
  const [newTitle, setNewTitle] = useState('');

  const completedCount = subtasks.filter(s => s.isCompleted).length;
  const totalCount = subtasks.length;

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newSubtask: Subtask = {
      id: 'sub-' + Math.random().toString(36).substring(2, 8),
      title: newTitle.trim(),
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };

    onChange([...subtasks, newSubtask]);
    setNewTitle('');
  };

  const toggleSubtask = (id: string) => {
    const updated = subtasks.map(s =>
      s.id === id ? { ...s, isCompleted: !s.isCompleted } : s
    );
    onChange(updated);
  };

  const removeSubtask = (id: string) => {
    onChange(subtasks.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckSquare size={16} className="text-sky-400" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Subtasks
          </h4>
        </div>
        {totalCount > 0 && (
          <span
            className={`text-xs font-mono font-medium px-2 py-0.5 rounded ${
              completedCount === totalCount
                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {completedCount} / {totalCount} Completed
          </span>
        )}
      </div>

      {/* Subtask items */}
      <div className="space-y-1.5">
        {subtasks.map(subtask => (
          <div
            key={subtask.id}
            className="flex items-center justify-between p-2 rounded-lg bg-[#0B0F17] border border-slate-800/80 hover:border-slate-700/80 transition-colors group"
          >
            <label className="flex items-center gap-2.5 flex-1 cursor-pointer min-w-0">
              <button
                type="button"
                onClick={() => toggleSubtask(subtask.id)}
                className={`w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                  subtask.isCompleted
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-slate-600 bg-transparent hover:border-slate-400'
                }`}
              >
                {subtask.isCompleted && <Check size={12} className="stroke-[3]" />}
              </button>
              <span
                className={`text-xs text-slate-200 truncate ${
                  subtask.isCompleted ? 'line-through text-slate-500' : ''
                }`}
              >
                {subtask.title}
              </span>
            </label>

            <button
              type="button"
              onClick={() => removeSubtask(subtask.id)}
              className="text-slate-600 hover:text-rose-400 p-1 rounded opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
              title="Delete subtask"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      {/* Quick Add Subtask Input */}
      <form onSubmit={handleAddSubtask} className="flex items-center gap-2 pt-1">
        <input
          type="text"
          placeholder="Add a subtask and press Enter..."
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          className="flex-1 bg-[#0B0F17] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
        />
        <Button
          type="submit"
          variant="secondary"
          size="xs"
          disabled={!newTitle.trim()}
          leftIcon={<Plus size={13} />}
        >
          Add
        </Button>
      </form>
    </div>
  );
};
