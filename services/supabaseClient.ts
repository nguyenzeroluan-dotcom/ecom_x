
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_KEY } from '../constants';
import { Product, Order, CartItem, UserProfile, Category, AppRole, InventoryLog } from '../types';
import { INITIAL_SETUP_SQL } from '../data/01_initial_setup';
import { USER_RBAC_SQL } from '../data/02_user_rbac';
import { ROLES_PERMISSIONS_SQL } from '../data/03_roles_permissions';
import { INVENTORY_ADVANCED_SQL } from '../data/04_inventory_advanced';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Combined SQL for Database Setup
export const DATABASE_SETUP_SQL = INITIAL_SETUP_SQL + '\n\n' + USER_RBAC_SQL + '\n\n' + ROLES_PERMISSIONS_SQL + '\n\n' + INVENTORY_ADVANCED_SQL;

// --- Product Services ---

export const getProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      if (error.code === '42P01') { // undefined_table
         console.warn("Table 'products' not found.");
         throw new Error("Table 'products' does not exist. Please run the SQL setup.");
      }
      throw new Error(error.message);
    }

    if (!data) {
      return [];
    }

    return data as Product[];
  } catch (e: any) {
    console.error("Unexpected error fetching products:", e);
    throw e;
  }
};

export const addProduct = async (product: Omit<Product, 'id'>): Promise<Product | null> => {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data as Product;
};

export const seedProducts = async (products: Omit<Product, 'id'>[]): Promise<void> => {
  const { error } = await supabase
    .from('products')
    .insert(products);

  if (error) {
    throw new Error(error.message);
  }
};

export const updateProduct = async (id: number | string, updates: Partial<Product>): Promise<Product | null> => {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data as Product;
};

export const deleteProduct = async (id: number | string): Promise<void> => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

export const deleteProducts = async (ids: (number | string)[]): Promise<void> => {
    if (ids.length === 0) return;
    const { error } = await supabase
        .from('products')
        .delete()
        .in('id', ids);
    
    if (error) throw new Error(error.message);
};

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

// --- Category Services (NEW CRUD) ---

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

export const uploadProductImage = async (file: File, bucket: string = 'product-images'): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (uploadError) {
    if (uploadError.message.includes('row-level security') || uploadError.message === 'new row violates row-level security policy') {
        throw new Error(`Storage Permission Error: ${uploadError.message}. Check SQL policies.`);
    }
    throw new Error(`Storage Upload Error: ${uploadError.message}`);
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  if (!data?.publicUrl) {
    throw new Error("Could not get public URL for the uploaded image. Check storage policies.");
  }

  return data.publicUrl;
};

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
                  
                  await supabase
                      .from('products')
                      .update({ stock: newStock })
                      .eq('id', item.id);
                      
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
