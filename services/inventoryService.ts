import { supabase } from './supabaseClient';
import { InventoryLog } from '../types';

// --- Inventory Log Services ---

export const logInventoryChange = async (
    productId: number | string, 
    productName: string,
    oldStock: number, 
    newStock: number, 
    reason: string,
    userId?: string,
    note?: string
): Promise<void> => {
    const change = newStock - oldStock;
    if (change === 0) return;

    const { error } = await supabase
        .from('inventory_logs')
        .insert([{
            product_id: productId,
            product_name: productName,
            previous_stock: oldStock,
            new_stock: newStock,
            change_amount: change,
            reason: reason,
            note: note,
            user_id: userId && userId !== 'demo-user-123' ? userId : null
        }]);

    if (error) {
        console.warn("Failed to log inventory change:", error.message);
        // Non-blocking error
    }
};

export const getInventoryLogs = async (): Promise<InventoryLog[]> => {
    const { data, error } = await supabase
        .from('inventory_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
    
    if (error) {
        if (error.code === '42P01') {
            return []; // Table doesn't exist yet
        }
        throw new Error(error.message);
    }
    return data as InventoryLog[];
};
