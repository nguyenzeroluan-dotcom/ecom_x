import { supabase } from './supabaseClient';
import { Category } from '../types';

export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
      // Return specific error for handling in hook
      throw new Error(error.message);
  }
  return data as Category[];
};

export const createCategory = async (category: Omit<Category, 'id'>): Promise<Category> => {
  const { data, error } = await supabase
    .from('categories')
    .insert([category])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Category;
};

export const updateCategory = async (id: number, updates: Partial<Category>): Promise<Category> => {
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Category;
};

export const deleteCategory = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
};

// Batch update for Product Categories (Renaming)
export const updateCategoryName = async (oldName: string, newName: string): Promise<void> => {
    const { error } = await supabase
        .from('products')
        .update({ category: newName })
        .eq('category', oldName);
    
    if (error) {
        throw new Error(error.message);
    }
};
