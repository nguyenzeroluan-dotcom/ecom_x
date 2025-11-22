
import { supabase } from './supabaseClient';
import { LibraryItem } from '../types';

export const getLibrary = async (userId: string): Promise<LibraryItem[]> => {
    if (!userId) return [];
    
    // If demo user, mock return (or if you set up RLS correctly, it might just work empty)
    if (userId === 'demo-user-123') {
        // Return some mock data if needed, or empty array
        return [];
    }

    const { data, error } = await supabase
        .from('user_library')
        .select(`
            *,
            product:products(*)
        `)
        .eq('user_id', userId);

    if (error) {
        if (error.code === '42P01') return []; // Table doesn't exist
        throw new Error(error.message);
    }

    return data as LibraryItem[];
};

export const addToLibrary = async (userId: string, productId: string | number): Promise<void> => {
    if (userId === 'demo-user-123') return;

    const { error } = await supabase
        .from('user_library')
        .insert([{
            user_id: userId,
            product_id: productId,
            last_position: 0
        }]);

    if (error) {
        // Ignore duplicate key error (already owns book)
        if (error.code !== '23505') {
            console.error("Failed to add to library:", error);
        }
    }
};

export const updateReadingProgress = async (libraryId: number, position: number): Promise<void> => {
    await supabase
        .from('user_library')
        .update({ last_position: position })
        .eq('id', libraryId);
};
