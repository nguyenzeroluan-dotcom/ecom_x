
import React from 'react';

interface UserToolbarProps {
  search: string;
  setSearch: (value: string) => void;
  roleFilter: string;
  setRoleFilter: (value: string) => void;
  userCount: number;
  roles: string[];
}

const UserToolbar: React.FC<UserToolbarProps> = ({
  search,
  setSearch,
  roleFilter,
  setRoleFilter,
  userCount,
  roles
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
      <div className="relative flex-1 w-full">
        <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/50 outline-none dark:text-white transition-shadow"
        />
      </div>
      <div className="flex gap-3 w-full sm:w-auto">
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="py-2.5 pl-3 pr-8 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/50 dark:text-white cursor-pointer capitalize"
        >
          <option value="All">All Roles</option>
          {roles.length > 0 ? (
            roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))
          ) : (
            <>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="customer">Customer</option>
            </>
          )}
        </select>
        <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 min-w-[100px] text-center shadow-inner">
          {userCount} Users
        </div>
      </div>
    </div>
  );
};

export default UserToolbar;
