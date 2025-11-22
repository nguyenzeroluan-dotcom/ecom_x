
import React from 'react';
import { useNotification } from '../../contexts/NotificationContext';

const ToastContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 w-full max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            p-4 rounded-xl shadow-2xl border flex items-center gap-3 transform transition-all duration-300 animate-slide-up-toast relative overflow-hidden
            ${notification.type === 'success' ? 'bg-white dark:bg-slate-800 border-green-200 dark:border-green-800' : ''}
            ${notification.type === 'error' ? 'bg-white dark:bg-slate-800 border-red-200 dark:border-red-800' : ''}
            ${notification.type === 'info' ? 'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-800' : ''}
          `}
        >
          {/* Progress Bar */}
          <div className={`absolute bottom-0 left-0 h-1 animate-progress-bar ${
            notification.type === 'success' ? 'bg-green-500' : 
            notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
          }`}></div>

          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center shrink-0
            ${notification.type === 'success' ? 'bg-green-100 dark:bg-green-900/20 text-green-500' : ''}
            ${notification.type === 'error' ? 'bg-red-100 dark:bg-red-900/20 text-red-500' : ''}
            ${notification.type === 'info' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-500' : ''}
          `}>
            <i className={`fas text-sm ${
              notification.type === 'success' ? 'fa-check' :
              notification.type === 'error' ? 'fa-exclamation-triangle' : 'fa-info-circle'
            }`}></i>
          </div>
          
          <p className="font-medium text-sm text-slate-700 dark:text-slate-200 flex-1">{notification.message}</p>
          
          <button 
            onClick={() => removeNotification(notification.id)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <i className="fas fa-times text-xs"></i>
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
