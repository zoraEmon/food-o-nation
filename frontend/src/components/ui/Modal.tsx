"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Use Portal to render outside the DOM hierarchy (avoids z-index issues)
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all">
      {/* Modal Content */}
      <div className="bg-background border-2 border-primary/20 dark:border-white/10 w-full max-w-4xl md:max-w-3xl rounded-lg shadow-2xl scale-100 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-primary/10">
          <h3 className="font-heading text-xl font-bold text-primary dark:text-secondary">
            {title}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar" style={{ minHeight: '56vh' }}>
          {children}
        </div>

      </div>
    </div>,
    document.body
  );
}