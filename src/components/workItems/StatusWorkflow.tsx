import React, { useState } from 'react';
import { WorkItem, WorkItemStatus, Version } from '../../types';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Textarea, Select } from '../common/Input';
import {
  Inbox,
  Calendar,
  PlayCircle,
  FlaskConical,
  CheckCircle2,
  ArrowRight,
  Check,
  X,
  RotateCcw,
  FastForward,
} from 'lucide-react';

interface StatusWorkflowProps {
  item: WorkItem;
  availableVersions: Version[];
  onStatusChange: (newStatus: WorkItemStatus) => Promise<void>;
  onRecordTestOutcome: (
    result: 'passed' | 'failed',
    notes: string,
    action?: 'return_to_progress' | 'move_to_future_version' | 'completed',
    futureVersionId?: string | null
  ) => Promise<void>;
}

const STEPS: { status: WorkItemStatus; label: string; icon: any }[] = [
  { status: 'backlog', label: 'Backlog', icon: Inbox },
  { status: 'planned', label: 'Planned', icon: Calendar },
  { status: 'in_progress', label: 'In Progress', icon: PlayCircle },
  { status: 'testing', label: 'Testing', icon: FlaskConical },
  { status: 'completed', label: 'Completed', icon: CheckCircle2 },
];

export const StatusWorkflow: React.FC<StatusWorkflowProps> = ({
  item,
  availableVersions,
  onStatusChange,
  onRecordTestOutcome,
}) => {
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testResult, setTestResult] = useState<'passed' | 'failed'>('passed');
  const [testNotes, setTestNotes] = useState('');
  const [failedOption, setFailedOption] = useState<'return_to_progress' | 'move_to_future_version'>('return_to_progress');
  const [futureVersionId, setFutureVersionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const currentStepIndex = STEPS.findIndex(s => s.status === item.status);

  const handleTestingSubmit = async () => {
    if (!testNotes.trim()) return;
    setIsLoading(true);
    try {
      if (testResult === 'passed') {
        await onRecordTestOutcome('passed', testNotes.trim(), 'completed');
      } else {
        await onRecordTestOutcome(
          'failed',
          testNotes.trim(),
          failedOption,
          failedOption === 'move_to_future_version' ? futureVersionId : undefined
        );
      }
      setIsTestModalOpen(false);
      setTestNotes('');
    } finally {
      setIsLoading(false);
    }
  };

  const futureVersionOptions = availableVersions.filter(v => v.id !== item.targetVersionId);

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
          Workflow Pipeline
        </span>
        <span className="text-xs text-slate-500 font-mono">
          Step {currentStepIndex + 1} of 5
        </span>
      </div>

      {/* Pipeline Visual Track */}
      <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isCurrent = step.status === item.status;
          const isPast = index < currentStepIndex;

          return (
            <React.Fragment key={step.status}>
              <div className="flex flex-col items-center gap-1.5 min-w-[70px]">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
                    isCurrent
                      ? 'bg-sky-500/20 text-sky-400 border-sky-500 ring-2 ring-sky-500/30'
                      : isPast
                      ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60'
                      : 'bg-[#0B0F17] text-slate-500 border-slate-800'
                  }`}
                >
                  <Icon size={18} />
                </div>
                <span
                  className={`text-[11px] font-medium whitespace-nowrap ${
                    isCurrent
                      ? 'text-sky-300 font-semibold'
                      : isPast
                      ? 'text-emerald-400/90'
                      : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {index < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-[2px] mb-5 mx-1 transition-colors min-w-[14px] ${
                    index < currentStepIndex ? 'bg-emerald-500/50' : 'bg-slate-800'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Action Prompt Based on Current State */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
        <div className="text-xs text-slate-400">
          {item.status === 'backlog' && (
            <span>Item is unassigned. Assign to a version or plan work.</span>
          )}
          {item.status === 'planned' && (
            <span>Ready for development when scheduled.</span>
          )}
          {item.status === 'in_progress' && (
            <span className="text-sky-400 font-medium">
              Development in progress. Must pass testing before becoming completed.
            </span>
          )}
          {item.status === 'testing' && (
            <span className="text-purple-400 font-medium">
              Work item in QA & Testing phase.
            </span>
          )}
          {item.status === 'completed' && (
            <span className="text-emerald-400 font-medium">
              Approved and passed testing!
            </span>
          )}
        </div>

        {/* Transition Buttons */}
        <div className="flex items-center gap-2">
          {item.status === 'backlog' && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onStatusChange('planned')}
              rightIcon={<ArrowRight size={13} />}
            >
              Move to Planned
            </Button>
          )}

          {item.status === 'planned' && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => onStatusChange('in_progress')}
              rightIcon={<ArrowRight size={13} />}
            >
              Start Development
            </Button>
          )}

          {/* CRITICAL RULE: In Progress moves to Testing, NOT to Completed */}
          {item.status === 'in_progress' && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => onStatusChange('testing')}
              leftIcon={<FlaskConical size={14} />}
              className="bg-purple-600 hover:bg-purple-500 shadow-purple-600/20"
            >
              Finish Dev ➔ Submit to Testing
            </Button>
          )}

          {/* Testing Step: Record Pass / Fail */}
          {item.status === 'testing' && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="danger"
                onClick={() => {
                  setTestResult('failed');
                  setIsTestModalOpen(true);
                }}
                leftIcon={<X size={14} />}
              >
                Fail Test
              </Button>

              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  setTestResult('passed');
                  setIsTestModalOpen(true);
                }}
                leftIcon={<Check size={14} />}
                className="bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20"
              >
                Pass Test ➔ Complete
              </Button>
            </div>
          )}

          {item.status === 'completed' && (
            <Button
              size="xs"
              variant="ghost"
              onClick={() => onStatusChange('in_progress')}
              leftIcon={<RotateCcw size={12} />}
              className="text-slate-400"
            >
              Reopen
            </Button>
          )}
        </div>
      </div>

      {/* Testing Outcome Modal */}
      <Modal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        title={
          testResult === 'passed' ? (
            <span className="text-emerald-400 flex items-center gap-2">
              <CheckCircle2 size={18} /> Approve & Pass Testing
            </span>
          ) : (
            <span className="text-rose-400 flex items-center gap-2">
              <X size={18} /> Testing Failed
            </span>
          )
        }
        subtitle={`Item: "${item.title}"`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <Textarea
            label="Testing Notes & Observations"
            placeholder={
              testResult === 'passed'
                ? 'e.g. All edge cases verified, points calculate correctly across test suite.'
                : 'e.g. Calculation underflow occurs on tied 2nd place finish. Negative points awarded.'
            }
            value={testNotes}
            onChange={e => setTestNotes(e.target.value)}
            required
            rows={3}
            autoFocus
          />

          {testResult === 'failed' && (
            <div className="space-y-3 p-3 rounded-xl bg-[#0B0F17] border border-slate-800">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Next Action for this Work Item:
              </label>

              {/* Option 1 */}
              <label className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-900/80 cursor-pointer border border-transparent hover:border-slate-800">
                <input
                  type="radio"
                  name="failedOption"
                  className="mt-1"
                  checked={failedOption === 'return_to_progress'}
                  onChange={() => setFailedOption('return_to_progress')}
                />
                <div className="text-xs">
                  <span className="font-semibold text-slate-200 block flex items-center gap-1.5">
                    <RotateCcw size={13} className="text-amber-400" />
                    Option 1: Return to In Progress (Same Version)
                  </span>
                  <span className="text-slate-400 mt-0.5 block">
                    Keep assigned to current version and fix immediately.
                  </span>
                </div>
              </label>

              {/* Option 2 */}
              <label className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-900/80 cursor-pointer border border-transparent hover:border-slate-800">
                <input
                  type="radio"
                  name="failedOption"
                  className="mt-1"
                  checked={failedOption === 'move_to_future_version'}
                  onChange={() => setFailedOption('move_to_future_version')}
                />
                <div className="text-xs flex-1">
                  <span className="font-semibold text-slate-200 block flex items-center gap-1.5">
                    <FastForward size={13} className="text-sky-400" />
                    Option 2: Move to Future Version
                  </span>
                  <span className="text-slate-400 mt-0.5 block">
                    Defer to a future release so this current version is not delayed. Resets status to Planned.
                  </span>

                  {failedOption === 'move_to_future_version' && (
                    <div className="mt-2">
                      <Select
                        value={futureVersionId}
                        onChange={e => setFutureVersionId(e.target.value)}
                      >
                        <option value="">-- Select Target Future Version --</option>
                        {futureVersionOptions.map(v => (
                          <option key={v.id} value={v.id}>
                            v{v.versionNumber} — {v.title}
                          </option>
                        ))}
                      </Select>
                    </div>
                  )}
                </div>
              </label>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
            <Button variant="ghost" size="sm" onClick={() => setIsTestModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={testResult === 'passed' ? 'primary' : 'danger'}
              size="sm"
              isLoading={isLoading}
              disabled={!testNotes.trim()}
              onClick={handleTestingSubmit}
            >
              {testResult === 'passed' ? 'Confirm Approval' : 'Submit Test Failure'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
