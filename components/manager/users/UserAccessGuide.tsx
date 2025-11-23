
import React from 'react';

const UserAccessGuide: React.FC = () => {
  return (
    <div className="mt-6 bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
      <h4 className="font-bold text-indigo-900 dark:text-indigo-300 mb-3 text-sm flex items-center">
        <i className="fas fa-shield-alt mr-2"></i> Access Control Guide
      </h4>
      <div className="space-y-3">
        <div className="flex gap-3">
          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-[10px] font-bold h-fit mt-0.5">ADMIN</span>
          <p className="text-xs text-indigo-800 dark:text-indigo-400 leading-relaxed">Full access. Can create/delete users, manage all products, and update system settings.</p>
        </div>
        <div className="flex gap-3">
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold h-fit mt-0.5">MANAGER</span>
          <p className="text-xs text-indigo-800 dark:text-indigo-400 leading-relaxed">Store operations. Can edit products and view orders, but cannot manage users.</p>
        </div>
        <div className="flex gap-3">
          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold h-fit mt-0.5">CUSTOMER</span>
          <p className="text-xs text-indigo-800 dark:text-indigo-400 leading-relaxed">Standard access. Can only view products and manage their own personal orders.</p>
        </div>
      </div>
    </div>
  );
};

export default UserAccessGuide;
