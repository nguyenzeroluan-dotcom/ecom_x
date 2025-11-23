
import { supabase } from './supabaseClient';
import { Order, CartItem } from '../types';
import { logInventoryChange } from './inventoryService';
import { updateProduct } from './productService';

// --- Order Services ---

export const createOrder = async (
  customerDetails: { name: string; email: string; user_id?: string },
  items: CartItem[],
  total: number,
  aiNote: string
): Promise<Order | null> => {
  
  // Handle demo user ID (not a valid UUID)
  const userIdToSave = (customerDetails.user_id && customerDetails.user_id !== 'demo-user-123') 
    ? customerDetails.user_id 
    : null;

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
  // Fetch orders and their items
  let query = supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*)
    `)
    .order('created_at', { ascending: false });

  if (userId && userId !== 'demo-user-123') {
    // This will throw an error if 'user_id' column doesn't exist or is UUID and userId is string
    query = query.eq('user_id', userId);
  } else if (email) {
    // Fallback for demo user or non-logged-in tracking by email
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

export const updateOrder = async (
    orderId: number, 
    updates: { status?: string, tracking_number?: string }
): Promise<Order> => {
    const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId)
        .select(`*, items:order_items(*)`)
        .single();

    if (error) throw new Error(error.message);
    return data as Order;
};

export const deleteOrder = async (orderId: number): Promise<void> => {
    const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);
    
    if (error) throw new Error(error.message);
};