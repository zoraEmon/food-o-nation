"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info';

interface NotificationPayload {
  title?: string;
  message?: string;
  type?: NotificationType;
  autoClose?: number; // ms
}

interface NotificationContextValue {
  showNotification: (payload: NotificationPayload) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within a NotificationProvider');
  return ctx;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState<NotificationPayload | null>(null);
  const timerRef = React.useRef<number | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    setPayload(null);
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const showNotification = useCallback((p: NotificationPayload) => {
    setPayload(p);
    setOpen(true);
    if (p.autoClose && p.autoClose > 0) {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        close();
      }, p.autoClose);
    }
  }, [close]);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}

      {/* Modal */}
      {open && payload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={close} />
          <div className="relative max-w-xl w-full mx-auto bg-white dark:bg-[#042617] text-current rounded-xl shadow-2xl border border-[#004225]">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className={`flex items-center justify-center rounded-full w-10 h-10 ${payload.type === 'success' ? 'bg-green-100 text-green-700' : payload.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                  {payload.type === 'success' && <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8.364 8.364a1 1 0 01-1.414 0L3.293 10.364a1 1 0 011.414-1.414l3.536 3.535 7.707-7.707a1 1 0 011.414 0z" clipRule="evenodd"/></svg>}
                  {payload.type === 'error' && <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3a1 1 0 011 1v4a1 1 0 11-2 0V4a1 1 0 011-1zm0 10a1 1 0 100-2 1 1 0 000 2z"/></svg>}
                  {payload.type === 'info' && <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 10a8 8 0 1116 0A8 8 0 012 10zM9 9a1 1 0 012 0v3a1 1 0 11-2 0V9zM10 6a1 1 0 100-2 1 1 0 000 2z"/></svg>}
                </div>
                <div className="flex-1">
                  {payload.title && <h3 className="font-bold text-lg">{payload.title}</h3>}
                  {payload.message && <p className="mt-2 text-sm text-muted-foreground">{payload.message}</p>}
                </div>
                <button onClick={close} className="text-gray-500 hover:text-gray-800 dark:text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};
