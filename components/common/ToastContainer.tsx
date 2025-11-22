
import React from 'react';
import { useNotification } from '../../contexts/NotificationContext';

const ToastContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            min-w-[300px] p-4 rounded-xl shadow-xl border flex items-center gap-3 transform transition-all duration-300 animate-slide-up-toast
            ${notification.type === 'success' ? 'bg-white border-green-100 text-green-800' : ''}
            ${notification.type === 'error' ? 'bg-white border-red-100 text-red-800' : ''}
            ${notification.type === 'info' ? 'bg-white border-blue-100 text-blue-800' : ''}
          `}
        >
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center shrink-0
            ${notification.type === 'success' ? 'bg-green-100 text-green-500' : ''}
            ${notification.type === 'error' ? 'bg-red-100 text-red-500' : ''}
            ${notification.type === 'info' ? 'bg-blue-100 text-blue-500' : ''}
          `}>
            <i className={`fas ${
              notification.type === 'success' ? 'fa-check' :
              notification.type === 'error' ? 'fa-exclamation' : 'fa-info'
            }`}></i>
          </div>
          
          <p className="font-medium text-sm text-slate-700 flex-1">{notification.message}</p>
          
          <button 
            onClick={() => removeNotification(notification.id)}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
