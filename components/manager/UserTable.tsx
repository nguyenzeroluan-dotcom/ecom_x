
import React from 'react';
import { UserProfile } from '../../types';

interface UserTableProps {
  users: UserProfile[];
  loading: boolean;
  onEdit: (user: UserProfile) => void;
  onDelete: (id: string) => void;
  currentUserId?: string;
}

const UserTable: React.FC<UserTableProps> = ({ users, loading, onEdit, onDelete, currentUserId }) => {
  if (loading) {
     return <div className="flex justify-center p-12"><i className="fas fa-spinner fa-spin text-2xl text-primary"></i></div>;
  }

  if (users.length === 0) {
     return (
         <div className="flex flex-col items-center justify-center p-12 text-slate-400">
            <i className="fas fa-users text-4xl mb-2"></i>
            <p>No users found.</p>
         </div>
     );
  }

  const getRoleBadge = (role: string) => {
      switch(role) {
          case 'admin': return 'bg-purple-100 text-purple-700 border-purple-200';
          case 'manager': return 'bg-blue-100 text-blue-700 border-blue-200';
          default: return 'bg-slate-100 text-slate-600 border-slate-200';
      }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700 mr-3 border border-slate-200 dark:border-slate-600">
                      <img className="h-full w-full object-cover" src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.email}`} alt="" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          {user.full_name || 'Unknown'}
                          {user.id === currentUserId && <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full">You</span>}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border uppercase tracking-wider ${getRoleBadge(user.role || 'customer')}`}>
                    {user.role || 'customer'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-slate-600 dark:text-slate-300">{user.phone || '-'}</div>
                  <div className="text-xs text-slate-400">{user.city || '-'}</div>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button 
                    onClick={() => onEdit(user)} 
                    className="text-slate-400 hover:text-blue-500 transition-colors p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg" 
                    title="Edit Role & Details"
                  >
                    <i className="fas fa-user-edit"></i>
                  </button>
                  <button 
                    onClick={() => onDelete(user.id)} 
                    disabled={user.id === currentUserId}
                    className={`text-slate-400 transition-colors p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg ${user.id === currentUserId ? 'opacity-30 cursor-not-allowed' : 'hover:text-red-500 hover:bg-red-50'}`} 
                    title="Delete User"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;
