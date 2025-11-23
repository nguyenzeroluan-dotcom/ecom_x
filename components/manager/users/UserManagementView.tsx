
import React from 'react';
import { UserProfile } from '../../../types';
import UserForm from '../UserForm';
import UserTable from '../UserTable';
import UserErrorBanner from './UserErrorBanner';
import UserAccessGuide from './UserAccessGuide';
import UserToolbar from './UserToolbar';

interface UserManagementViewProps {
  // Data
  users: UserProfile[];
  loading: boolean;
  error: string | null;
  currentUser: UserProfile | null;
  availableRoles: string[];
  
  // Filter State
  search: string;
  setSearch: (val: string) => void;
  roleFilter: string;
  setRoleFilter: (val: string) => void;
  
  // Edit State
  isEditing: boolean;
  editingUser: UserProfile | null;
  actionLoading: boolean;
  
  // Actions
  onSubmit: (data: Partial<UserProfile>) => Promise<boolean>;
  onCancelEdit: () => void;
  onEditUser: (user: UserProfile) => void;
  onDeleteUser: (id: string) => void;
}

const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  loading,
  error,
  currentUser,
  availableRoles,
  search,
  setSearch,
  roleFilter,
  setRoleFilter,
  isEditing,
  editingUser,
  actionLoading,
  onSubmit,
  onCancelEdit,
  onEditUser,
  onDeleteUser
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      {/* Error Banner */}
      <UserErrorBanner error={error} />

      {/* Left Column: Form & Guide */}
      <div className="lg:col-span-1">
        <UserForm
          initialData={editingUser}
          isEditing={isEditing}
          onSubmit={onSubmit}
          onCancel={onCancelEdit}
          isLoading={actionLoading}
          roles={availableRoles}
        />
        <UserAccessGuide />
      </div>

      {/* Right Column: Toolbar & Table */}
      <div className="lg:col-span-2 space-y-4">
        <UserToolbar 
          search={search}
          setSearch={setSearch}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          userCount={users.length}
          roles={availableRoles}
        />

        <UserTable
          users={users}
          loading={loading}
          onEdit={onEditUser}
          onDelete={onDeleteUser}
          currentUserId={currentUser?.id}
        />
      </div>
    </div>
  );
};

export default UserManagementView;
