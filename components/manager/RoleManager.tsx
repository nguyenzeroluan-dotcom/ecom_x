
import React, { useState, useEffect } from 'react';
import { AppRole } from '../../types';
import { getAppRoles, createAppRole, updateAppRole, deleteAppRole } from '../../services/supabaseClient';
import { ROLES_PERMISSIONS_SQL } from '../../data/03_roles_permissions';
import { useModal } from '../../contexts/ModalContext';
import { ModalType } from '../../types';
import RoleForm from './RoleForm';

const RoleManager: React.FC = () => {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingRole, setEditingRole] = useState<AppRole | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { openModal } = useModal();

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAppRoles();
      setRoles(data);
    } catch (e: any) {
      console.error("Fetch roles failed", e);
      if (e.message?.includes('relation "public.app_roles" does not exist') || e.message?.includes('42P01')) {
          setError("Missing Database Table: 'app_roles'");
      } else {
          setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleSubmit = async (data: AppRole) => {
      setActionLoading(true);
      try {
          if (isEditing && editingRole) {
              await updateAppRole(editingRole.role_name, { 
                  description: data.description,
                  permissions: data.permissions 
              });
              openModal(ModalType.SUCCESS, { title: "Role Updated", message: `Permissions for '${data.role_name}' have been updated.` });
          } else {
              await createAppRole(data);
              openModal(ModalType.SUCCESS, { title: "Role Created", message: `New role '${data.role_name}' is ready.` });
          }
          await fetchRoles();
          setIsEditing(false);
          setEditingRole(null);
          return true;
      } catch (e: any) {
          openModal(ModalType.CONFIRM, { title: "Error", message: e.message });
          return false;
      } finally {
          setActionLoading(false);
      }
  };

  const handleDelete = (roleName: string) => {
      if (['admin', 'manager', 'customer'].includes(roleName)) {
          openModal(ModalType.CONFIRM, { title: "Protected Role", message: "System roles (admin, manager, customer) cannot be deleted." });
          return;
      }
      openModal(ModalType.CONFIRM, {
          title: "Delete Role",
          message: `Are you sure you want to delete '${roleName}'? Users with this role may lose access permissions.`,
          isDestructive: true,
          onConfirm: async () => {
              try {
                  await deleteAppRole(roleName);
                  setRoles(prev => prev.filter(r => r.role_name !== roleName));
              } catch (e: any) {
                  alert(e.message);
              }
          }
      });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
        
        {/* Error Banner */}
        {error && (
            <div className="col-span-1 lg:col-span-3 bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-r-xl shadow-sm">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <i className="fas fa-database text-red-500 mt-1"></i>
                    </div>
                    <div className="ml-3 w-full">
                        <h3 className="text-lg font-bold text-red-800 mb-1">Database Update Required</h3>
                        <p className="text-sm text-red-700 mb-3">
                            The `app_roles` table is missing. Please run the following SQL to enable Role Management.
                        </p>
                        <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto shadow-inner border border-slate-700">
                            <div className="flex justify-between items-center mb-2 text-xs">
                                <span className="text-slate-400 font-bold uppercase">SQL Script</span>
                                <button onClick={() => navigator.clipboard.writeText(ROLES_PERMISSIONS_SQL)} className="text-white bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition"><i className="fas fa-copy"></i> Copy SQL</button>
                            </div>
                            <pre className="text-blue-400 text-xs font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">{ROLES_PERMISSIONS_SQL}</pre>
                        </div>
                    </div>
                </div>
            </div>
        )}

        <div className="lg:col-span-1">
             <RoleForm 
                initialData={editingRole}
                isEditing={isEditing}
                onSubmit={handleSubmit}
                onCancel={() => { setIsEditing(false); setEditingRole(null); }}
                isLoading={actionLoading}
             />
             <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50">
                 <div className="flex gap-3 mb-2">
                     <i className="fas fa-info-circle text-blue-500 mt-1"></i>
                     <h4 className="font-bold text-blue-900 dark:text-blue-300 text-sm">How Permissions Work</h4>
                 </div>
                 <p className="text-xs text-blue-800 dark:text-blue-400 leading-relaxed">
                     Permissions define what users with this role can do. For example, `product.delete` allows removing items from inventory. These are enforced by the application logic.
                 </p>
             </div>
        </div>

        <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                 <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                     <h3 className="font-bold text-slate-800 dark:text-white">Defined Roles</h3>
                     <span className="text-xs font-bold bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-full text-slate-600 dark:text-slate-300">{roles.length} Roles</span>
                 </div>
                 
                 {loading ? (
                     <div className="p-12 flex justify-center"><i className="fas fa-spinner fa-spin text-primary text-2xl"></i></div>
                 ) : (
                     <div className="divide-y divide-slate-100 dark:divide-slate-700">
                         {roles.map(role => (
                             <div key={role.role_name} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                 <div className="flex justify-between items-start mb-3">
                                     <div>
                                         <div className="flex items-center gap-2">
                                             <h4 className="text-lg font-bold text-slate-900 dark:text-white capitalize">{role.role_name}</h4>
                                             {['admin', 'manager', 'customer'].includes(role.role_name) && (
                                                 <i className="fas fa-lock text-slate-300 text-xs" title="System Role"></i>
                                             )}
                                         </div>
                                         <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{role.description || 'No description provided.'}</p>
                                     </div>
                                     <div className="flex gap-2">
                                         <button 
                                            onClick={() => { setEditingRole(role); setIsEditing(true); window.scrollTo({top:0, behavior:'smooth'}); }} 
                                            className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                         >
                                             <i className="fas fa-edit"></i>
                                         </button>
                                         <button 
                                            onClick={() => handleDelete(role.role_name)}
                                            className={`p-2 text-slate-400 rounded-lg transition-colors ${['admin', 'manager', 'customer'].includes(role.role_name) ? 'opacity-30 cursor-not-allowed' : 'hover:text-red-500 hover:bg-red-50'}`}
                                         >
                                             <i className="fas fa-trash"></i>
                                         </button>
                                     </div>
                                 </div>
                                 
                                 <div>
                                     <p className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">Assigned Permissions</p>
                                     <div className="flex flex-wrap gap-2">
                                         {role.permissions && role.permissions.length > 0 ? (
                                             role.permissions.map(perm => (
                                                 <span key={perm} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md text-[10px] font-mono text-slate-600 dark:text-slate-300">
                                                     {perm}
                                                 </span>
                                             ))
                                         ) : (
                                             <span className="text-xs text-slate-400 italic">No specific permissions assigned.</span>
                                         )}
                                     </div>
                                 </div>
                             </div>
                         ))}
                     </div>
                 )}
            </div>
        </div>
    </div>
  );
};

export default RoleManager;
