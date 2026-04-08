import React, { useEffect } from 'react';
import { RiCloseLine } from 'react-icons/ri';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity animate-fade-in dark:bg-black/70"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-xl border shadow-2xl transform transition-all animate-fade-in
                        bg-white border-slate-200 shadow-slate-900/20
                        dark:bg-[#0a1628] dark:border-[#0f2a4a] dark:shadow-black/60">

          {/* Modal header */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b
                          bg-white/95 border-slate-100
                          dark:bg-[#060f1e] dark:border-[#0f2a4a]">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight dark:text-[#e2e8f0]">
                {title}
              </h2>
              <p className="text-[9px] font-mono uppercase tracking-[0.18em] text-slate-400 mt-0.5 dark:text-[#2a4a6a]">
                Detailed Analysis
              </p>
            </div>

            {/* Top accent line (dark) */}
            <div className="absolute top-0 left-0 right-0 h-px hidden dark:block
                            bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg transition-colors
                         text-slate-400 hover:text-slate-600 hover:bg-slate-100
                         dark:text-[#4a6080] dark:hover:text-[#e2e8f0] dark:hover:bg-white/[0.04]"
            >
              <RiCloseLine className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-5">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
