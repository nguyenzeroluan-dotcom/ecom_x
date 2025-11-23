
import { supabase } from './supabaseClient';

export const fetchWishlistItems = async (userId: string): Promise<(number | string)[]> => {
    const { data, error } = await supabase
        .from('wishlist_items')
        .select('product_id')
        .eq('user_id', userId);

    if (error) {
        // If table doesn't exist yet, return empty array seamlessly
        if (error.code === '42P01') return [];
        throw new Error(error.message);
    }

    return data ? data.map(item => item.product_id) : [];
};

export const addWishlistItem = async (userId: string, productId: number | string): Promise<void> => {
    const { error } = await supabase
        .from('wishlist_items')
        .insert([{ user_id: userId, product_id: productId }]);

    if (error) {
        // Ignore duplicate key errors (already wishlisted)
        if (error.code !== '23505') throw new Error(error.message);
    }
};

export const removeWishlistItem = async (userId: string, productId: number | string): Promise<void> => {
    const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .match({ user_id: userId, product_id: productId });

    if (error) throw new Error(error.message);
};

export const syncLocalWishlistToDB = async (userId: string, localIds: (number | string)[]): Promise<boolean> => {
    if (localIds.length === 0) return true;

    const items = localIds.map(id => ({
        user_id: userId,
        product_id: id
    }));

    const { error } = await supabase
        .from('wishlist_items')
        .upsert(items, { onConflict: 'user_id, product_id', ignoreDuplicates: true });

    if (error) {
        if (error.code === '42P01') {
            console.warn("Wishlist table not found (42P01). Skipping sync.");
            return false;
        }
        if (error.code === '23503') { // Foreign Key Violation
             console.error("Wishlist DB sync failed: Foreign Key Violation. Please run 'SQL Setup #21' to fix the demo user constraint.");
             return false;
        }
        console.error("Failed to sync wishlist:", error.message);
        return false;
    }
    return true;
};
