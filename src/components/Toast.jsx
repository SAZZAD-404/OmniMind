import React, { useEffect, useState } from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

export default function Toast({ message, type = 'error', onClose, duration = 4000 }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, message]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300); // match CSS animation
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle size={18} />;
      case 'info': return <Info size={18} />;
      default: return <AlertCircle size={18} />;
    }
  };

  return (
    <div className={`toast-container ${type} ${isExiting ? 'exit' : ''}`}>
      <div className="toast-icon">{getIcon()}</div>
      <div className="toast-content">{message}</div>
      <button className="toast-close" onClick={handleClose}>
        <X size={16} />
      </button>
    </div>
  );
}
