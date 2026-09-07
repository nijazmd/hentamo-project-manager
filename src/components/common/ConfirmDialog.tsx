import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary' | 'secondary';
  showReasonInput?: boolean;
  reasonPlaceholder?: string;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  showReasonInput = false,
  reasonPlaceholder = 'Reason (optional)',
  isLoading = false,
}) => {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    onConfirm(showReasonInput ? reason : undefined);
    setReason('');
  };

  const handleCancel = () => {
    setReason('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      maxWidth="sm"
      title={
        <div className="flex items-center gap-2 text-rose-400">
          <AlertTriangle size={20} />
          <span>{title}</span>
        </div>
      }
      actions={
        <>
          <Button variant="ghost" size="sm" onClick={handleCancel} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button variant={variant} size="sm" onClick={handleConfirm} isLoading={isLoading}>
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="space-y-3 text-sm text-slate-300">
        <p>{message}</p>
        {showReasonInput && (
          <div className="pt-2">
            <Input
              label="Deletion Reason (Optional)"
              placeholder={reasonPlaceholder}
              value={reason}
              onChange={e => setReason(e.target.value)}
              autoFocus
            />
          </div>
        )}
      </div>
    </Modal>
  );
};
