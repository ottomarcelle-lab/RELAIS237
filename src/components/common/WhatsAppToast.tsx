import React from 'react';
import { MessageSquare, Check, X } from 'lucide-react';

interface WhatsAppToastProps {
  notification: {
    sender: string;
    message: string;
    code?: string;
  } | null;
  onDismiss: () => void;
  onApplyCode?: (code: string) => void;
}

export const WhatsAppToast: React.FC<WhatsAppToastProps> = ({
  notification,
  onDismiss,
  onApplyCode,
}) => {
  if (!notification) return null;

  return (
    <div className="fixed top-16 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in slide-in-from-top-4 duration-300">
      <div className="bg-[#25D366] text-slate-950 p-3.5 rounded-2xl shadow-2xl border border-emerald-300 flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
            <MessageSquare className="w-4 h-4 text-[#25D366] fill-[#25D366]" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs uppercase tracking-wide">
                WhatsApp Business · {notification.sender}
              </span>
              <span className="text-[10px] text-slate-800">À l'instant</span>
            </div>
            <p className="text-xs font-medium text-slate-950 leading-snug">
              {notification.message}
            </p>
            {notification.code && onApplyCode && (
              <button
                onClick={() => onApplyCode(notification.code!)}
                className="mt-2 text-xs font-bold bg-slate-950 text-white px-3 py-1.5 rounded-lg hover:bg-slate-900 transition-colors inline-flex items-center gap-1.5 shadow-sm"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Insérer le code {notification.code}</span>
              </button>
            )}
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="text-slate-800 hover:text-black p-1 transition-colors"
          title="Fermer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
