import { supabase } from './supabaseClient';
import { Product } from '../types';

// --- Product Services ---

export const getProducts = async (): Promise<Product[]> => {
  // 1. Attempt to fetch from the optimized view which includes gallery images.
  const { data: viewData, error: viewError } = await supabase
    .from('products_with_gallery')
    .select('*')
    .order('id', { ascending: false });
  
  // 2. If the view query is successful, process and return the data.
  if (!viewError && viewData) {
    const products = viewData.map(p => ({
      ...p,
      gallery_images: p.gallery_images || [] // Ensure gallery_images is always an array.
    }));
    return products as Product[];
  }

  // 3. If the view doesn't exist (e.g., migration not run), fall back to the base products table.
  if (viewError && viewError.code === '42P01') { // 42P01: undefined_table
    console.warn("View 'products_with_gallery' not found. Falling back to 'products' table. Run SQL setup for gallery features.");
    
    const { data: tableData, error: tableError } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: false });
      
    if (tableError) {
      // If even the base table fails, then it's a legitimate error to throw.
       if (tableError.code === '42P01') {
         throw new Error("Database setup is incomplete. Table 'products' does not exist. Please run the initial SQL setup.");
       }
      throw new Error(`Fallback to 'products' table failed: ${tableError.message}`);
    }

    if (!tableData) {
      return [];
    }

    // Manually add the gallery_images property to maintain a consistent Product shape.
    const products = tableData.map(p => ({
      ...p,
      gallery_images: []
    }));
    
    return products as Product[];
  }

  // 4. Handle other unexpected errors from the initial view query.
  if (viewError) {
    console.error("Error fetching from 'products_with_gallery':", viewError);
    throw new Error(viewError.message);
  }

  // 5. Return an empty array as a final safeguard.
  return [];
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
