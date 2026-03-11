/**
 * ConfirmDialog.jsx
 * Production practice: Replace window.confirm() with a proper modal dialog.
 * window.confirm() blocks the JS thread, can't be styled, and looks unprofessional.
 */
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ isOpen, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      {/* Panel — stop click propagation so backdrop click doesn't trigger inner clicks */}
      <div
        className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className="shrink-0 p-2 bg-red-100 rounded-full">
            <AlertTriangle size={22} className="text-red-600" />
          </div>
          <div>
            <h3 id="confirm-dialog-title" className="font-bold text-gray-800">
              Confirm Action
            </h3>
            <p className="mt-1 text-sm text-gray-500">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
