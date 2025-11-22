import { supabase } from './supabaseClient';
import { UserProfile, AppRole } from '../types';

// --- User Profile Services ---

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  // If demo user, avoid DB call that expects UUID
  if (userId === 'demo-user-123') return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error) {
      return null;
  }
  return data as UserProfile;
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> => {
    // If demo user, mock return
    if (userId === 'demo-user-123') return { ...updates, id: userId, email: 'demo@nexus.ai' } as UserProfile;

    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: userId, ...updates, updated_at: new Date() })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return data as UserProfile;
};

// --- Admin User Management Services ---

export const getAllUsers = async (): Promise<UserProfile[]> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data as UserProfile[];
};

export const createUserProfile = async (profile: Partial<UserProfile>): Promise<UserProfile> => {
    // Generate a random UUID for the profile if one isn't provided
    const newId = profile.id || crypto.randomUUID();
    
    const { data, error } = await supabase
        .from('profiles')
        .insert([{ 
            ...profile, 
            id: newId,
            created_at: new Date() 
        }])
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data as UserProfile;
};

export const deleteUser = async (userId: string): Promise<void> => {
    const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

    if (error) throw new Error(error.message);
};

// --- Role Management Services ---

export const getAppRoles = async (): Promise<AppRole[]> => {
  const { data, error } = await supabase
      .from('app_roles')
      .select('*')
      .order('role_name', { ascending: true });
  
  if (error) throw new Error(error.message);
  return data as AppRole[];
};

export const createAppRole = async (role: AppRole): Promise<AppRole> => {
  const { data, error } = await supabase
      .from('app_roles')
      .insert([role])
      .select()
      .single();
  
  if (error) throw new Error(error.message);
  return data as AppRole;
};

export const updateAppRole = async (roleName: string, updates: Partial<AppRole>): Promise<AppRole> => {
  const { data, error } = await supabase
      .from('app_roles')
      .update(updates)
      .eq('role_name', roleName)
      .select()
      .single();
  
  if (error) throw new Error(error.message);
  return data as AppRole;
};

export const deleteAppRole = async (roleName: string): Promise<void> => {
  const { error } = await supabase
      .from('app_roles')
      .delete()
      .eq('role_name', roleName);
  
  if (error) throw new Error(error.message);
};
