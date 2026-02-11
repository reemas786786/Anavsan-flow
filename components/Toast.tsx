import React, { useEffect, useState } from 'react';
import { IconCheckCircle, IconClose } from '../constants';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
    } else {
      // Allow fade-out animation before removing from DOM
      const timer = setTimeout(() => setIsVisible(false), 2800);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!message && !isVisible) return null;

  return (
    <div
      className={`fixed top-5 right-5 z-50 transform transition-all duration-300 ease-in-out ${
        isVisible && message ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'
      }`}
    >
      <div className="bg-status-success text-white rounded-full shadow-lg flex items-center p-1 pr-3">
        <div className="bg-white rounded-full p-1 mr-2 flex-shrink-0">
            <IconCheckCircle className="h-5 w-5 text-status-success" />
        </div>
        <p className="text-sm font-medium">{message}</p>
        <button onClick={onClose} className="ml-4 p-1 rounded-full text-white/70 hover:text-white hover:bg-white/20">
          <IconClose className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
