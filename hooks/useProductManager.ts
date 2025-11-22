import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { 
  getProducts, 
  addProduct, 
  updateProduct, 
  deleteProduct,
  deleteProducts,
  seedProducts
} from '../services/productService';
import { 
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../services/categoryService';
import { uploadMediaAsset } from '../services/mediaService';
import { identifyProductFromImage } from '../services/geminiService';
import { Product, Category, ModalType } from '../types';
import { useModal } from '../contexts/ModalContext';
import { useAuth } from '../contexts/AuthContext';

export const useProductManager = () => {
  const { openModal } = useModal();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [setupRequired, setSetupRequired] = useState(false);
  
  // Action States
  const [seeding, setSeeding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([
          getProducts(),
          getCategories()
      ]);
      setProducts(prods);
      setCategories(cats);
      if (!setupRequired) setError(null);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError("Failed to load data. " + (err.message || ""));
      
      // Check for missing table errors (42P01 is undefined_table)
      if (
          err.message?.includes("Table 'products' does not exist") || 
          err.message?.includes("Could not find the table") || 
          err.message?.includes("relation \"public.categories\" does not exist") ||
          err.message?.includes('42P01')
      ) {
        setSetupRequired(true);
      }
    } finally {
      setLoading(false);
    }
  }, [setupRequired]);

  // Real-time subscription
  useEffect(() => {
    fetchData();

    const productChannel = supabase
      .channel('products-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchData();
      })
      .subscribe();

    const categoryChannel = supabase
      .channel('categories-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(productChannel);
      supabase.removeChannel(categoryChannel);
    };
  }, [fetchData]);

  // --- Product Actions ---

  const handleSaveProduct = async (productData: Omit<Product, 'id'>, id?: string | number) => {
    try {
      if (id) {
        await updateProduct(id, productData);
        // Optimistic Update
        setProducts(prev => prev.map(p => p.id === id ? { ...p, ...productData } : p));
        openModal(ModalType.SUCCESS, { title: "Product Updated", message: "The product has been successfully updated." });
      } else {
        const newProd = await addProduct(productData);
        if (newProd) setProducts(prev => [newProd, ...prev]);
        openModal(ModalType.SUCCESS, { title: "Product Added", message: "New product has been added to the inventory." });
      }
      return true;
    } catch (err: any) {
      console.error("Save failed:", err);
      if (err.message?.includes('relation "public.products" does not exist') || err.message?.includes('42P01')) {
        setSetupRequired(true);
        setError("Database table missing. Please run the SQL setup.");
      } else {
        setError(err.message || "An error occurred.");
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }
  };

  const handleDeleteProduct = async (id: number | string) => {
    openModal(ModalType.CONFIRM, {
      title: "Delete Product",
      message: "Are you sure you want to delete this product? This action cannot be undone.",
      isDestructive: true,
      onConfirm: async () => {
         try {
            await deleteProduct(id);
            setProducts(prev => prev.filter(p => p.id !== id));
          } catch (err: any) {
            openModal(ModalType.CONFIRM, { title: "Error", message: "Failed to delete: " + err.message });
          }
      }
    });
  };

  const handleDeleteProducts = (ids: (string | number)[]) => {
    openModal(ModalType.CONFIRM, {
      title: `Delete ${ids.length} Products`,
      message: `Are you sure you want to delete these ${ids.length} selected products? This action cannot be undone.`,
      isDestructive: true,
      onConfirm: async () => {
         try {
            await deleteProducts(ids);
            setProducts(prev => prev.filter(p => !ids.includes(p.id)));
            openModal(ModalType.SUCCESS, { title: "Products Deleted", message: `${ids.length} products have been successfully removed.` });
          } catch (err: any) {
            setError("Failed to delete products: " + (err.message || "An unknown error occurred."));
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
      }
    });
  };

  // --- Category Actions ---

  const handleAddCategory = async (category: Omit<Category, 'id'>) => {
      try {
          await createCategory(category);
          return true;
      } catch (e: any) {
          setError("Failed to add category: " + e.message);
          return false;
      }
  };

  const handleUpdateCategory = async (id: number, updates: Partial<Category>) => {
      try {
          await updateCategory(id, updates);
          return true;
      } catch (e: any) {
          setError("Failed to update category: " + e.message);
          return false;
      }
  };

  const handleDeleteCategory = async (id: number) => {
      try {
          await deleteCategory(id);
          return true;
      } catch (e: any) {
          openModal(ModalType.CONFIRM, { title: "Error", message: "Failed to delete category: " + e.message });
          return false;
      }
  };


  // --- Misc Actions ---

  const handleSeedData = async (demoData: any[]) => {
    openModal(ModalType.CONFIRM, {
      title: "Generate Demo Data",
      message: "This will add demo products and categories to your database. Continue?",
      onConfirm: async () => {
        setSeeding(true);
        setError(null);
        try {
          // Basic seed
          await seedProducts(demoData);
          openModal(ModalType.SUCCESS, { title: "Data Generated", message: "Successfully added demo products." });
          await fetchData();
        } catch (err: any) {
          setError("Failed to seed data: " + err.message);
          if (err.message?.includes('relation "public.products" does not exist')) {
            setSetupRequired(true);
          }
        } finally {
          setSeeding(false);
        }
      }
    });
  };

  const handleImageUpload = async (file: File): Promise<string | null> => {
    setUploading(true);
    setError(null);
    setSetupRequired(false);
    try {
      const asset = await uploadMediaAsset(file, user?.id);
      return asset.public_url;
    } catch (err: any) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (err.message?.includes("Bucket not found") || err.message?.includes("Storage Upload Error")) {
           setSetupRequired(true);
           setError("Storage bucket 'product-images' is missing. Please run the SQL setup.");
      } else {
           setError(`Upload failed: ${err.message}`);
      }
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleMagicAnalysis = async (file: File) => {
    setIsAnalyzing(true);
    setError(null);
    setSetupRequired(false);
    try {
      const publicUrl = await handleImageUpload(file);
      if (!publicUrl) throw new Error("Image upload failed, cannot analyze.");

      // Convert to Base64 for Gemini
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
      });

      const aiData = await identifyProductFromImage(base64, file.type);
      return { ...aiData, image_url: publicUrl };

    } catch (err: any) {
      if (!setupRequired) setError("AI Analysis failed: " + err.message);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const dismissError = () => setError(null);

  return {
    // State
    products,
    categories,
    loading,
    error,
    setupRequired,
    seeding,
    uploading,
    isAnalyzing,
    // Actions
    refreshData: fetchData,
    handleSaveProduct,
    handleDeleteProduct,
    handleDeleteProducts,
    handleAddCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    handleSeedData,
    handleImageUpload,
    handleMagicAnalysis,
    dismissError
  };
};
