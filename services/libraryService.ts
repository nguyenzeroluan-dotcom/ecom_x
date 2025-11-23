
import { supabase } from './supabaseClient';
import { LibraryItem } from '../types';
import { DEMO_USER_UUID } from '../constants';

export const getLibrary = async (userId: string): Promise<LibraryItem[]> => {
    if (!userId) return [];
    
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

// NEW: Robust Synchronization Function (Case-Insensitive & Fuzzy)
export const syncOrdersToLibrary = async (userId: string): Promise<number> => {
    if (!userId) return 0;

    // 1. Get all valid orders for user (Smart Demo Fallback)
    let query = supabase
        .from('orders')
        .select('id')
        .neq('status', 'cancelled')
        .neq('status', 'returned');

    if (userId === DEMO_USER_UUID) {
        // For Demo Admin, fetch orders by ID OR by Email (for orphans)
        query = query.or(`user_id.eq.${userId},customer_email.eq.admin@nexus.ai`);
    } else {
        query = query.eq('user_id', userId);
    }

    const { data: orders } = await query;
    
    if (!orders || orders.length === 0) return 0;
    const orderIds = orders.map(o => o.id);

    // 2. Get items for these orders
    const { data: items } = await supabase
        .from('order_items')
        .select('product_id, product_name') 
        .in('order_id', orderIds);

    if (!items || items.length === 0) return 0;

    // 3. Fetch ALL potential digital/book products from the store
    // We fetch loosely to ensure we catch everything, then filter strictly in JS
    const { data: candidates } = await supabase
        .from('products')
        .select('id, name, is_digital, category, ebook_metadata(id)')
        .or('is_digital.eq.true,category.ilike.%book%,name.ilike.%book%,category.ilike.%digital%');

    if (!candidates || candidates.length === 0) return 0;

    // 4. Match Orders to Candidates (Robust Logic)
    const itemsToAdd: any[] = [];
    const processedProductIds = new Set<number>();

    for (const candidate of candidates) {
        // Heuristic: Is this candidate a "book"?
        const isDigital = candidate.is_digital === true;
        const hasMetadata = candidate.ebook_metadata && (Array.isArray(candidate.ebook_metadata) ? candidate.ebook_metadata.length > 0 : !!candidate.ebook_metadata);
        const nameLower = (candidate.name || '').toLowerCase();
        const catLower = (candidate.category || '').toLowerCase();
        const looksLikeBook = nameLower.includes('book') || catLower.includes('book') || catLower.includes('digital');

        if (!isDigital && !hasMetadata && !looksLikeBook) continue;

        // CHECK: Did user buy this?
        const bought = items.some(item => {
            // A. Strict ID Match
            if (item.product_id && item.product_id === candidate.id) return true;
            
            // B. Loose Name Match (Case Insensitive)
            if (item.product_name && item.product_name.trim().toLowerCase() === nameLower.trim()) return true;

            return false;
        });

        if (bought && !processedProductIds.has(candidate.id)) {
            itemsToAdd.push({
                user_id: userId,
                product_id: candidate.id,
                last_position: 0
            });
            processedProductIds.add(candidate.id);
        }
    }

    if (itemsToAdd.length === 0) return 0;

    // 5. Insert into Library (Upsert)
    const { error } = await supabase
        .from('user_library')
        .upsert(itemsToAdd, { onConflict: 'user_id, product_id', ignoreDuplicates: true });
    
    if (error) {
        console.error("Sync library error:", error);
    }

    return itemsToAdd.length;
};
