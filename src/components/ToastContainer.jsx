/**
 * ToastContainer.jsx — Renders active toast notifications
 * Production practice: Notifications should be non-blocking and auto-dismiss.
 */
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const ICONS = {
  success: <CheckCircle size={18} />,
  error: <XCircle size={18} />,
  info: <Info size={18} />,
  warning: <AlertTriangle size={18} />,
};

const STYLES = {
  success: 'bg-green-600 text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-blue-600 text-white',
  warning: 'bg-yellow-500 text-white',
};

export default function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="alert"
          aria-live="polite"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all animate-fade-in ${STYLES[t.type]}`}
        >
          <span className="shrink-0">{ICONS[t.type]}</span>
          <span className="flex-1">{t.message}</span>
          {onDismiss && (
            <button
              onClick={() => onDismiss(t.id)}
              className="shrink-0 opacity-70 hover:opacity-100"
              aria-label="Dismiss notification"
            >
              <X size={15} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
