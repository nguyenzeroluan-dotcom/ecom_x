
import React, { useState, useEffect } from 'react';
import { getAllUsers, updateUserProfile, createUserProfile, deleteUser } from '../../services/supabaseClient';
import { USER_RBAC_SQL } from '../../data/02_user_rbac';
import { UserProfile } from '../../types';
import UserTable from './UserTable';
import UserForm from './UserForm';
import { useModal } from '../../contexts/ModalContext';
import { ModalType } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

const UserManager: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  const { openModal } = useModal();
  const { user: currentUser } = useAuth();

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error: any) {
      console.error("Failed to fetch users", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user: UserProfile) => {
    setEditingUser(user);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setIsEditing(false);
  };

  const handleSubmit = async (data: Partial<UserProfile>) => {
    setActionLoading(true);
    setError(null);
    try {
        if (isEditing && editingUser) {
            await updateUserProfile(editingUser.id, data);
            openModal(ModalType.SUCCESS, { title: "User Updated", message: `Successfully updated role and details for ${data.full_name || 'user'}.` });
        } else {
            // Create mode
            await createUserProfile(data);
            openModal(ModalType.SUCCESS, { title: "User Created", message: "New user profile has been added to the system." });
        }
        await fetchUsers();
        handleCancelEdit();
        return true;
    } catch (e: any) {
        console.error(e);
        // Explicitly handle common database errors
        const isPermError = e.message.includes('policy') || e.message.includes('permission') || e.message.includes('row-level security');
        const isFKError = e.message.includes('profiles_id_fkey') || e.message.includes('foreign key constraint');
        
        if (isFKError) {
             setError("Database Constraint Error: The 'profiles' table is still linked to Auth. Please run the updated SQL script to fix this.");
             openModal(ModalType.CONFIRM, { 
                title: "Database Update Required", 
                message: "We need to update the database to allow creating demo users. Please go to the 'SQL Setup' tab, copy the 'User Management' script, and run it in Supabase." 
            });
        } else if (isPermError) {
             setError("Database Permission Error: Please run the updated SQL script in the 'SQL Setup' tab.");
             openModal(ModalType.CONFIRM, { 
                title: "Permission Error", 
                message: "The database blocked this action. Please run the updated SQL script in the 'SQL Setup' tab to fix permissions." 
            });
        } else {
             setError("Operation failed: " + e.message);
        }
        return false;
    } finally {
        setActionLoading(false);
    }
  };

  const handleDelete = (id: string) => {
      openModal(ModalType.CONFIRM, {
          title: "Delete User",
          message: "Are you sure? This will remove the user profile permanently.",
          isDestructive: true,
          onConfirm: async () => {
              try {
                  await deleteUser(id);
                  setUsers(prev => prev.filter(u => u.id !== id));
              } catch (e: any) {
                  setError("Failed to delete: " + e.message);
              }
          }
      });
  };

  const filteredUsers = users.filter(u => {
      const matchesSearch = (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
                            u.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === 'All' || u.role === roleFilter;
      return matchesSearch && matchesRole;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
        {/* Error Banner */}
        {error && (
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
                                <button onClick={() => navigator.clipboard.writeText(USER_RBAC_SQL)} className="text-white bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition"><i className="fas fa-copy"></i> Copy SQL</button>
                            </div>
                            <pre className="text-blue-400 text-xs font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">{USER_RBAC_SQL}</pre>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Left: Form */}
        <div className="lg:col-span-1">
            <UserForm 
                initialData={editingUser}
                isEditing={isEditing}
                onSubmit={handleSubmit}
                onCancel={handleCancelEdit}
                isLoading={actionLoading}
            />
            
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
        </div>

        {/* Right: Table */}
        <div className="lg:col-span-2 space-y-4">
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
                        className="py-2.5 pl-3 pr-8 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/50 dark:text-white cursor-pointer"
                    >
                        <option value="All">All Roles</option>
                        <option value="admin">Admins</option>
                        <option value="manager">Managers</option>
                        <option value="customer">Customers</option>
                    </select>
                    <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 min-w-[100px] text-center shadow-inner">
                        {filteredUsers.length} Users
                    </div>
                 </div>
            </div>

            <UserTable 
                users={filteredUsers}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                currentUserId={currentUser?.id}
            />
        </div>
    </div>
  );
};

export default UserManager;
