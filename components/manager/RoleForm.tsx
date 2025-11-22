
import React, { useState, useEffect } from 'react';
import { AppRole, SYSTEM_PERMISSIONS } from '../../types';

interface RoleFormProps {
  initialData?: AppRole | null;
  onSubmit: (data: AppRole) => Promise<boolean>;
  onCancel: () => void;
  isEditing: boolean;
  isLoading: boolean;
}

const RoleForm: React.FC<RoleFormProps> = ({ initialData, onSubmit, onCancel, isEditing, isLoading }) => {
  const [formData, setFormData] = useState<AppRole>({
    role_name: '',
    description: '',
    permissions: []
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ role_name: '', description: '', permissions: [] });
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const togglePermission = (permissionId: string) => {
    setFormData(prev => {
      const exists = prev.permissions.includes(permissionId);
      if (exists) {
        return { ...prev, permissions: prev.permissions.filter(p => p !== permissionId) };
      } else {
        return { ...prev, permissions: [...prev.permissions, permissionId] };
      }
    });
  };

  const toggleGroup = (groupName: string) => {
      const groupPerms = SYSTEM_PERMISSIONS.filter(p => p.group === groupName).map(p => p.id);
      const allSelected = groupPerms.every(p => formData.permissions.includes(p));
      
      setFormData(prev => {
          let newPerms = [...prev.permissions];
          if (allSelected) {
              // Remove all
              newPerms = newPerms.filter(p => !groupPerms.includes(p));
          } else {
              // Add missing
              groupPerms.forEach(p => {
                  if (!newPerms.includes(p)) newPerms.push(p);
              });
          }
          return { ...prev, permissions: newPerms };
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  // Group permissions for UI
  const groupedPermissions = SYSTEM_PERMISSIONS.reduce((acc, perm) => {
      if (!acc[perm.group]) acc[perm.group] = [];
      acc[perm.group].push(perm);
      return acc;
  }, {} as Record<string, typeof SYSTEM_PERMISSIONS>);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sticky top-24">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                {isEditing ? 'Edit Role Configuration' : 'Create New Role'}
            </h2>
            <button onClick={onCancel} className="text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-300 px-2 py-1 rounded transition">Cancel</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Role Name (ID)</label>
                <input 
                    type="text" 
                    name="role_name" 
                    value={formData.role_name}
                    onChange={handleInputChange}
                    disabled={isEditing}
                    placeholder="e.g. editor"
                    className={`w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 focus:outline-none dark:bg-slate-900 dark:text-white ${isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
                    required
                />
                <p className="text-[10px] text-slate-400 mt-1">Unique identifier. Cannot be changed once created.</p>
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea 
                    name="description" 
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe what this role can do..."
                    rows={2}
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 focus:outline-none dark:bg-slate-900 dark:text-white resize-none"
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Permissions</label>
                <div className="space-y-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {Object.entries(groupedPermissions).map(([group, perms]) => {
                         const allInGroupSelected = perms.every(p => formData.permissions.includes(p.id));
                         return (
                            <div key={group} className="mb-4 last:mb-0">
                                <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-200 dark:border-slate-700">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase">{group}</h4>
                                    <button 
                                        type="button"
                                        onClick={() => toggleGroup(group)}
                                        className="text-[10px] text-primary hover:underline font-medium"
                                    >
                                        {allInGroupSelected ? 'Deselect All' : 'Select All'}
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {perms.map(perm => (
                                        <label key={perm.id} className="flex items-center p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                                            <input 
                                                type="checkbox"
                                                checked={formData.permissions.includes(perm.id)}
                                                onChange={() => togglePermission(perm.id)}
                                                className="w-4 h-4 text-primary rounded focus:ring-primary/50 border-gray-300"
                                            />
                                            <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">{perm.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <button type="submit" disabled={isLoading} className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all flex justify-center items-center ${isEditing ? 'bg-secondary hover:bg-green-600 shadow-green-500/20' : 'bg-primary hover:bg-indigo-600 shadow-indigo-500/20'} disabled:opacity-50`}>
                {isLoading ? <><i className="fas fa-spinner fa-spin mr-2"></i> Saving...</> : isEditing ? <><i className="fas fa-save mr-2"></i> Update Permissions</> : <><i className="fas fa-plus-circle mr-2"></i> Create Role</>}
            </button>
        </form>
    </div>
  );
};

export default RoleForm;
