import React, { useEffect } from 'react';
import { RiCheckLine, RiCloseLine, RiInformationLine } from 'react-icons/ri';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  show: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'success', show, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const colors = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const icons = {
    success: <RiCheckLine className="w-5 h-5" />,
    error: <RiCloseLine className="w-5 h-5" />,
    info: <RiInformationLine className="w-5 h-5" />
  };

  return (
    <div className="fixed top-24 right-8 z-[200] animate-fade-in">
      <div className={`flex items-center space-x-3 px-6 py-4 rounded-xl border shadow-lg backdrop-blur-xl ${colors[type]}`}>
        {icons[type]}
        <span className="font-semibold">{message}</span>
        <button onClick={onClose} className="ml-4 hover:opacity-70 transition-opacity">
          <RiCloseLine className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
