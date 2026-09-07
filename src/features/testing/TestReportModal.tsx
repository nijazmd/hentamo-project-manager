import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input, Textarea, Select } from '../../components/common/Input';
import { TestReport, Version } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { testReportService } from '../../services/dbStore';

interface TestReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  availableVersions: Version[];
  onReportSaved: () => void;
}

export const TestReportModal: React.FC<TestReportModalProps> = ({
  isOpen,
  onClose,
  projectId,
  availableVersions,
  onReportSaved,
}) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [versionId, setVersionId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [platform, setPlatform] = useState('iOS');
  const [device, setDevice] = useState('iPhone 13 Pro Max');
  const [browser, setBrowser] = useState('Safari');
  const [passedCount, setPassedCount] = useState<number>(0);
  const [failedCount, setFailedCount] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setVersionId(availableVersions[0]?.id || '');
      setDate(new Date().toISOString().substring(0, 10));
      setPlatform('iOS');
      setDevice('iPhone 13 Pro Max');
      setBrowser('Safari');
      setPassedCount(0);
      setFailedCount(0);
      setNotes('');
    }
  }, [isOpen, availableVersions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !user || !projectId) return;

    setIsLoading(true);
    try {
      await testReportService.createTestReport({
        projectId,
        userId: user.uid,
        versionId: versionId || null,
        title: title.trim(),
        date: new Date(date).toISOString(),
        platform,
        device,
        browser,
        passedCount: Number(passedCount) || 0,
        failedCount: Number(failedCount) || 0,
        notes: notes.trim(),
      });
      onReportSaved();
      onClose();
    } catch (err) {
      console.error('Failed to save test report:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Version Test Report"
      subtitle="Record multi-device QA runs, passed/failed test cases, and environment details"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Report Title"
          placeholder="e.g. Sanity Run - Safari & Mobile Viewport"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          autoFocus
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Associated Version"
            value={versionId}
            onChange={e => setVersionId(e.target.value)}
          >
            <option value="">-- No Specific Version --</option>
            {availableVersions.map(v => (
              <option key={v.id} value={v.id}>
                v{v.versionNumber} ({v.title})
              </option>
            ))}
          </Select>

          <Input
            label="Test Date"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Platform"
            placeholder="e.g. iOS, macOS, Web"
            value={platform}
            onChange={e => setPlatform(e.target.value)}
            required
          />

          <Input
            label="Device"
            placeholder="e.g. iPhone 13 Pro Max"
            value={device}
            onChange={e => setDevice(e.target.value)}
            required
          />

          <Input
            label="Browser"
            placeholder="e.g. Safari, Chrome"
            value={browser}
            onChange={e => setBrowser(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Tests Passed"
            type="number"
            min={0}
            value={passedCount}
            onChange={e => setPassedCount(parseInt(e.target.value) || 0)}
          />

          <Input
            label="Tests Failed"
            type="number"
            min={0}
            value={failedCount}
            onChange={e => setFailedCount(parseInt(e.target.value) || 0)}
          />
        </div>

        <Textarea
          label="Observations & Retrospective Notes"
          placeholder="Summary of bugs found, performance observations, blockers..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
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
            disabled={!title.trim()}
          >
            Save Test Report
          </Button>
        </div>
      </form>
    </Modal>
  );
};
