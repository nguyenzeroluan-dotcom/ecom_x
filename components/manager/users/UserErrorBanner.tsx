
import React from 'react';
import { USER_RBAC_SQL } from '../../../data/02_user_rbac';

interface UserErrorBannerProps {
  error: string | null;
}

const UserErrorBanner: React.FC<UserErrorBannerProps> = ({ error }) => {
  if (!error) return null;

  return (
    <div className="col-span-1 lg:col-span-3 bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-r-xl shadow-sm">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <i className="fas fa-exclamation-circle text-red-500 mt-1"></i>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-red-800 font-bold">User Management Error</h3>
          <p className="text-red-700 text-sm mb-3">{error}</p>

          <div className="bg-slate-900 rounded-lg p-3 overflow-x-auto">
            <div className="flex justify-between items-center mb-2 text-xs">
              <span className="text-slate-400 font-bold uppercase">Required SQL Update</span>
              <button
                onClick={() => navigator.clipboard.writeText(USER_RBAC_SQL)}
                className="text-white bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition"
                title="Copy to clipboard"
              >
                <i className="fas fa-copy"></i> Copy SQL
              </button>
            </div>
            <pre className="text-blue-400 text-xs font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
              {USER_RBAC_SQL}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserErrorBanner;
