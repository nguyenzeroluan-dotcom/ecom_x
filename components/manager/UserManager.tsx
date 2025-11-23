
import React, { useState, useEffect } from 'react';
import { getAllUsers, updateUserProfile, createUserProfile, deleteUser, getAppRoles } from '../../services/userService';
import { UserProfile } from '../../types';
import { useModal } from '../../contexts/ModalContext';
import { ModalType } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import UserManagementView from './users/UserManagementView';

const UserManager: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  const { openModal } = useModal();
  const { user: currentUser } = useAuth();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersData, rolesData] = await Promise.all([
        getAllUsers(),
        getAppRoles().catch(() => []) // Fallback to empty if roles table missing
      ]);
      
      setUsers(usersData);
      
      if (rolesData && rolesData.length > 0) {
        setRoles(rolesData.map(r => r.role_name));
      } else {
        // Fallback roles if API returns empty
        setRoles(['admin', 'manager', 'customer']);
      }

    } catch (error: any) {
      console.error("Failed to fetch user data", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (user: UserProfile) => {
    setEditingUser(user);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        await fetchData(); // Refresh all data
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
    <UserManagementView 
      users={filteredUsers}
      loading={loading}
      error={error}
      currentUser={currentUser}
      availableRoles={roles}
      search={search}
      setSearch={setSearch}
      roleFilter={roleFilter}
      setRoleFilter={setRoleFilter}
      isEditing={isEditing}
      editingUser={editingUser}
      actionLoading={actionLoading}
      onSubmit={handleSubmit}
      onCancelEdit={handleCancelEdit}
      onEditUser={handleEdit}
      onDeleteUser={handleDelete}
    />
  );
};

export default UserManager;
