
import { supabase } from './supabaseClient';
import { Order, CartItem } from '../types';
import { logInventoryChange } from './inventoryService';
import { updateProduct } from './productService';
import { DEMO_USER_UUID } from '../constants';

// --- Order Services ---

export const createOrder = async (
  customerDetails: { name: string; email: string; user_id?: string },
  items: CartItem[],
  total: number,
  aiNote: string
): Promise<Order | null> => {
  
  // For the demo to work seamlessly, we need to allow the DEMO_USER_UUID to be saved.
  // The SQL script #14 removes the FK constraint to auth.users to allow this.
  const userIdToSave = customerDetails.user_id || null;

  // 1. Insert Order
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert([{
      customer_name: customerDetails.name,
      customer_email: customerDetails.email,
      user_id: userIdToSave,
      total_amount: total,
      status: 'pending',
      ai_note: aiNote
    }])
    .select()
    .single();

  if (orderError) {
    if (orderError.code === '42P01') {
       throw new Error("Table 'orders' does not exist. Please run the SQL setup.");
    }
    throw new Error(orderError.message);
  }

  if (!orderData) return null;

  // 2. Prepare Order Items
  const orderItems = items.map(item => ({
    order_id: orderData.id,
    product_id: item.id,
    product_name: item.name,
    price: item.price,
    quantity: item.quantity,
    image_url: item.image_url
  }));

  // 3. Insert Items
  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    console.error("Failed to save items", itemsError);
  }

  // 4. Update Inventory & Log It
  try {
      for (const item of items) {
          if (item.id) {
              const { data: product } = await supabase
                  .from('products')
                  .select('stock, name')
                  .eq('id', item.id)
                  .single();
                  
              if (product) {
                  const currentStock = product.stock || 0;
                  const newStock = Math.max(0, currentStock - item.quantity);
                  
                  await updateProduct(item.id, { stock: newStock });
                      
                  // Log the sale
                  await logInventoryChange(item.id, product.name, currentStock, newStock, 'sale', userIdToSave || undefined, 'Online Order #' + orderData.id);
              }
          }
      }
  } catch (stockError) {
      console.error("Failed to update stock levels", stockError);
  }

  return orderData as Order;
};

export const getOrders = async (userId?: string, email?: string): Promise<Order[]> => {
  let query = supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*)
    `)
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  } else if (email) {
    query = query.eq('customer_email', email);
  }

  const { data, error } = await query;

  if (error) {
    if (error.code === '42P01') {
       throw new Error("Table 'orders' does not exist.");
    }
    throw new Error(error.message);
  }

  return data as Order[];
};

export const getAllOrders = async (): Promise<Order[]> => {
    const { data, error } = await supabase
        .from('orders')
        .select(`
            *,
            items:order_items(*)
        `)
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data as Order[];
};

// Fulfills digital items by adding them to the user's library
// UPGRADED: Now uses fuzzy matching and auto-detection for books
const fulfillDigitalItems = async (orderId: number) => {
    // 1. Get order items and user_id details
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('user_id, customer_email, items:order_items(product_id, product_name)')
        .eq('id', orderId)
        .single();

    if (orderError || !order) {
        console.log("Fulfillment skipped: Invalid order");
        return; 
    }

    // IMPORTANT: Resolve User ID. 
    // If it's the Demo Admin email but user_id is null (legacy/orphan), assign to DEMO_USER_UUID
    const targetUserId = order.user_id || (order.customer_email === 'admin@nexus.ai' ? DEMO_USER_UUID : null);

    if (!targetUserId) {
        console.log("Fulfillment skipped: No user account linked to this order.");
        return;
    }

    const items = order.items || [];
    if (items.length === 0) return;

    // 2. Fetch all candidate products from DB that *could* be digital matches
    // We fetch broadly to handle the fuzzy logic in JS to be absolutely sure we match
    const { data: candidates, error: prodError } = await supabase
        .from('products')
        .select('id, name, category, is_digital');

    if (prodError || !candidates) return;

    const libraryEntries: any[] = [];

    for (const item of items) {
        // Find the matching product in the candidates list
        const matchedProduct = candidates.find(p => {
            // A. Match by ID if available (Best)
            if (item.product_id && p.id === item.product_id) return true;
            // B. Fallback: Match by Exact Name (Case Insensitive)
            if (item.product_name && p.name.trim().toLowerCase() === item.product_name.trim().toLowerCase()) return true;
            return false;
        });

        if (matchedProduct) {
            // Heuristic: Is it a book/digital item?
            // We check:
            // 1. Is 'is_digital' true?
            // 2. Does category contain 'Book'?
            // 3. Does name contain 'Book'?
            const isExplicitlyDigital = matchedProduct.is_digital === true;
            const isBookCategory = (matchedProduct.category || '').toLowerCase().includes('book') || (matchedProduct.category || '').toLowerCase().includes('digital');
            const isBookName = matchedProduct.name.toLowerCase().includes('book') || matchedProduct.name.toLowerCase().includes('digital');

            if (isExplicitlyDigital || isBookCategory || isBookName) {
                libraryEntries.push({
                    user_id: targetUserId,
                    product_id: matchedProduct.id,
                    last_position: 0,
                    // purchase_date defaults to now() in DB
                });
            }
        }
    }

    if (libraryEntries.length === 0) return;

    // 3. Insert into user_library
    const { error: libError } = await supabase
        .from('user_library')
        .upsert(libraryEntries, { onConflict: 'user_id, product_id', ignoreDuplicates: true });

    if (libError) {
        // Enhanced Error Logging
        console.error("Digital Fulfillment Error:", JSON.stringify(libError, null, 2));
    } else {
        console.log(`Successfully fulfilled ${libraryEntries.length} digital items for User ${targetUserId}`);
    }
};

export const updateOrder = async (
    orderId: number, 
    updates: { status?: string, tracking_number?: string }
): Promise<Order> => {
    // 1. Update Order Status
    const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId)
        .select(`*, items:order_items(*)`)
        .single();

    if (error) throw new Error(error.message);

    // 2. Trigger Digital Fulfillment if Status is Shipped or Delivered
    if (updates.status && ['shipped', 'delivered'].includes(updates.status.toLowerCase())) {
        try {
            await fulfillDigitalItems(orderId);
        } catch (e) {
            console.error("Fulfillment warning:", e);
            // We don't block the order update, but we log the warning. 
        }
    }

    return data as Order;
};

export const deleteOrder = async (orderId: number): Promise<void> => {
    const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);
    
    if (error) throw new Error(error.message);
};
