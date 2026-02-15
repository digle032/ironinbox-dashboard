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
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      {/* Dynamic Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-slate-900/20 max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-white/50 transform transition-all duration-300 animate-fade-in">
          {/* Header */}
          <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-5 flex items-center justify-between z-10">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
              <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-wider font-semibold">Detailed Analysis</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all duration-200"
            >
              <RiCloseLine className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="px-8 py-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
