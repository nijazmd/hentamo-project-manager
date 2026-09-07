import React, { useState } from 'react';
import { TestCase } from '../../types';
import { Button } from '../common/Button';
import { FlaskConical, Plus, Check, X, Trash2, HelpCircle } from 'lucide-react';

interface TestCaseManagerProps {
  testCases: TestCase[];
  onChange: (updatedTestCases: TestCase[]) => void;
}

export const TestCaseManager: React.FC<TestCaseManagerProps> = ({
  testCases = [],
  onChange,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const passedCount = testCases.filter(t => t.status === 'passed').length;
  const failedCount = testCases.filter(t => t.status === 'failed').length;

  const handleAddTestCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newCase: TestCase = {
      id: 'tc-' + Math.random().toString(36).substring(2, 8),
      title: newTitle.trim(),
      status: 'untested',
      notes: newNotes.trim() || undefined,
    };

    onChange([...testCases, newCase]);
    setNewTitle('');
    setNewNotes('');
    setIsAdding(false);
  };

  const updateStatus = (id: string, status: TestCase['status']) => {
    onChange(
      testCases.map(tc => (tc.id === id ? { ...tc, status } : tc))
    );
  };

  const removeTestCase = (id: string) => {
    onChange(testCases.filter(tc => tc.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FlaskConical size={16} className="text-purple-400" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Lightweight Test Cases
          </h4>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          {passedCount > 0 && (
            <span className="text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-1.5 py-0.5 rounded">
              {passedCount} Passed
            </span>
          )}
          {failedCount > 0 && (
            <span className="text-rose-400 bg-rose-950/40 border border-rose-800/40 px-1.5 py-0.5 rounded">
              {failedCount} Failed
            </span>
          )}
        </div>
      </div>

      {/* Test Case list */}
      <div className="space-y-1.5">
        {testCases.map(tc => (
          <div
            key={tc.id}
            className="flex items-start justify-between p-2.5 rounded-lg bg-[#0B0F17] border border-slate-800/80 hover:border-slate-700/80 transition-colors group"
          >
            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-200">
                  {tc.title}
                </span>
              </div>
              {tc.notes && (
                <p className="text-[11px] text-slate-400 mt-1 pl-0.5 font-mono">
                  Notes: {tc.notes}
                </p>
              )}
            </div>

            {/* Status action buttons */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => updateStatus(tc.id, 'passed')}
                className={`p-1.5 rounded transition-all cursor-pointer ${
                  tc.status === 'passed'
                    ? 'bg-emerald-500 text-white'
                    : 'text-slate-500 hover:text-emerald-400 hover:bg-slate-800'
                }`}
                title="Mark Passed"
              >
                <Check size={13} className="stroke-[2.5]" />
              </button>

              <button
                type="button"
                onClick={() => updateStatus(tc.id, 'failed')}
                className={`p-1.5 rounded transition-all cursor-pointer ${
                  tc.status === 'failed'
                    ? 'bg-rose-500 text-white'
                    : 'text-slate-500 hover:text-rose-400 hover:bg-slate-800'
                }`}
                title="Mark Failed"
              >
                <X size={13} className="stroke-[2.5]" />
              </button>

              <button
                type="button"
                onClick={() => updateStatus(tc.id, 'untested')}
                className={`p-1.5 rounded transition-all cursor-pointer ${
                  tc.status === 'untested'
                    ? 'bg-slate-700 text-slate-200'
                    : 'text-slate-600 hover:text-slate-400 hover:bg-slate-800'
                }`}
                title="Reset to Untested"
              >
                <HelpCircle size={13} />
              </button>

              <button
                type="button"
                onClick={() => removeTestCase(tc.id)}
                className="text-slate-600 hover:text-rose-400 p-1.5 rounded opacity-0 group-hover:opacity-100 transition-all cursor-pointer ml-1"
                title="Delete Test Case"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Test Case Form */}
      {isAdding ? (
        <form onSubmit={handleAddTestCase} className="p-3 rounded-xl bg-[#0B0F17] border border-slate-800 space-y-2">
          <input
            type="text"
            placeholder="Test case title (e.g. Points calculate correctly on tied race)"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            autoFocus
          />
          <input
            type="text"
            placeholder="Notes or verification criteria (optional)"
            value={newNotes}
            onChange={e => setNewNotes(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
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
              disabled={!newTitle.trim()}
            >
              Add Test Case
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
        >
          Add Test Case
        </Button>
      )}
    </div>
  );
};
