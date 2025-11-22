
import React, { useState, useEffect, useRef } from 'react';
import { getProducts, addProduct, updateProduct, deleteProduct, uploadProductImage, seedProducts, supabase } from '../services/supabaseClient';
import { identifyProductFromImage } from '../services/geminiService';
import { Product, ModalType } from '../types';
import { useModal } from '../contexts/ModalContext';

const DEMO_DATA = [
  {
    name: "Ultra-Slim 4K Monitor",
    price: 349.99,
    category: "Electronics",
    description: "27-inch display with HDR support and bezel-less design.",
    image_url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Vintage Leather Satchel",
    price: 129.50,
    category: "Fashion",
    description: "Handcrafted genuine leather bag with brass fittings.",
    image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Smart Home Hub",
    price: 89.99,
    category: "Electronics",
    description: "Control your entire home with voice commands.",
    image_url: "https://images.unsplash.com/photo-1558002038-109177381793?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Abstract Canvas Print",
    price: 59.00,
    category: "Art",
    description: "Modern abstract art piece, 24x36 inches.",
    image_url: "https://images.unsplash.com/photo-1549887534-1541e9326642?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Ergonomic Mesh Chair",
    price: 249.00,
    category: "Office",
    description: "High-back chair with lumbar support for long hours.",
    image_url: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Ceramic Plant Pot Set",
    price: 45.00,
    category: "Home",
    description: "Set of 3 minimal white ceramic pots with saucers.",
    image_url: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Noise-Cancelling Headphones",
    price: 199.95,
    category: "Electronics",
    description: "Wireless over-ear headphones with 30h battery life.",
    image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Running Sneakers",
    price: 110.00,
    category: "Fashion",
    description: "Lightweight breathable mesh running shoes.",
    image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Bamboo Desk Lamp",
    price: 35.00,
    category: "Home",
    description: "Eco-friendly bamboo lamp with warm LED light.",
    image_url: "https://images.unsplash.com/photo-1513506003011-3b03c80175e8?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Mechanical Keyboard",
    price: 145.00,
    category: "Office",
    description: "RGB backlit keyboard with Cherry MX Blue switches.",
    image_url: "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Minimalist Watch",
    price: 180.00,
    category: "Fashion",
    description: "Stainless steel case with genuine leather strap.",
    image_url: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Oil Painting Set",
    price: 75.00,
    category: "Art",
    description: "Professional grade oil paints, set of 24 colors.",
    image_url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=400&q=80"
  }
];

const ProductManager: React.FC = () => {
  const { openModal } = useModal();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [setupRequired, setSetupRequired] = useState(false); // Unified state for missing table or bucket
  
  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Home',
    description: '',
    image_url: ''
  });
  const [uploading, setUploading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  
  // AI Magic State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const magicInputRef = useRef<HTMLInputElement>(null);

  // Stats
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + (Number(p.price) || 0), 0);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
      // Only clear error if it wasn't a setup error (to preserve setup instructions if needed)
      if (!setupRequired) {
          setError(null);
      }
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError("Failed to load products. " + (err.message || ""));
      if (err.message?.includes("Table 'products' does not exist") || err.message?.includes('42P01')) {
        setSetupRequired(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // Real-time subscription
  useEffect(() => {
    fetchProducts();

    const channel = supabase
      .channel('table-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
        },
        (payload) => {
          console.log('Real-time change received:', payload);
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      setError(null);
      setSetupRequired(false);
      try {
        const publicUrl = await uploadProductImage(e.target.files[0]);
        setFormData(prev => ({ ...prev, image_url: publicUrl }));
      } catch (err: any) {
        console.error(err);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (err.message?.includes("Bucket not found") || 
            err.message?.includes("Storage Upload Error") ||
            err.message?.includes("The resource was not found")) {
             setSetupRequired(true);
             setError("Storage bucket 'product-images' is missing. Please run the SQL setup below.");
        } else {
             setError(`Upload failed: ${err.message}`);
        }
      } finally {
        setUploading(false);
      }
    }
  };

  // --- New AI Magic Import Logic ---
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64String = result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleMagicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    setIsAnalyzing(true);
    setError(null);
    setSetupRequired(false);

    try {
      // 1. Upload to Supabase immediately to get URL
      // We catch errors here specifically to detect bucket issues early
      const publicUrl = await uploadProductImage(file);
      
      // 2. Convert to Base64 for Gemini
      const base64 = await convertToBase64(file);
      
      // 3. Analyze with Gemini
      const aiData = await identifyProductFromImage(base64, file.type);
      
      // 4. Populate Form
      setFormData({
        name: aiData.name || '',
        price: aiData.price ? String(aiData.price) : '',
        category: aiData.category || 'Home',
        description: aiData.description || '',
        image_url: publicUrl
      });

      // Scroll to form
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } catch (err: any) {
      console.error("Magic upload failed:", err);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      if (err.message?.includes("Bucket not found") || 
          err.message?.includes("Storage Upload Error") || 
          err.message?.includes("The resource was not found")) {
         setSetupRequired(true);
         setError("Storage bucket 'product-images' is missing. Please run the SQL setup below.");
      } else {
         setError("AI Analysis failed. " + err.message);
      }
    } finally {
      setIsAnalyzing(false);
      // Reset input
      if (magicInputRef.current) magicInputRef.current.value = '';
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      category: 'Home',
      description: '',
      image_url: ''
    });
    setIsEditing(false);
    setCurrentId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEditClick = (product: Product) => {
    setIsEditing(true);
    setCurrentId(product.id);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category || 'Home',
      description: product.description,
      image_url: product.image_url
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSeedData = async () => {
    // Use Modal instead of window.confirm
    openModal(ModalType.CONFIRM, {
      title: "Generate Demo Data",
      message: "This will add 12 demo products to your database. It may take a few seconds. Continue?",
      onConfirm: async () => {
        setSeeding(true);
        setError(null);
        
        try {
          console.log("Starting seed...");
          await seedProducts(DEMO_DATA);
          console.log("Seed complete.");
          openModal(ModalType.SUCCESS, { title: "Data Generated", message: "Successfully added 12 demo products to your inventory." });
          await fetchProducts();
        } catch (err: any) {
          console.error("Seeding failed:", err);
          setError("Failed to seed data: " + err.message);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          if (err.message?.includes('relation "public.products" does not exist') || err.message?.includes('42P01')) {
            setSetupRequired(true);
          }
        } finally {
          setSeeding(false);
        }
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSetupRequired(false);

    try {
      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description,
        image_url: formData.image_url || 'https://via.placeholder.com/400',
        category: formData.category
      };

      if (isEditing && currentId) {
        await updateProduct(currentId, productData);
        openModal(ModalType.SUCCESS, { title: "Product Updated", message: "The product has been successfully updated." });
      } else {
        await addProduct(productData);
        openModal(ModalType.SUCCESS, { title: "Product Added", message: "New product has been added to the inventory." });
      }
      
      resetForm();
      fetchProducts(); 
    } catch (err: any) {
      console.error("Operation failed:", err);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (err.message?.includes('relation "public.products" does not exist') || err.message?.includes('42P01')) {
        setSetupRequired(true);
        setError("Database table missing. Please run the SQL setup below.");
      } else {
        setError(err.message || "An error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number | string) => {
    openModal(ModalType.CONFIRM, {
      title: "Delete Product",
      message: "Are you sure you want to delete this product? This action cannot be undone.",
      isDestructive: true,
      onConfirm: async () => {
         try {
            await deleteProduct(id);
            // Optimistic update not really needed since we have real-time, but good for UX feel
            // setProducts(prev => prev.filter(p => p.id !== id)); 
          } catch (err: any) {
            alert("Failed to delete: " + err.message);
          }
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Product Manager</h1>
          <p className="text-slate-500">Real-time inventory management</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
           <button
            onClick={handleSeedData}
            disabled={seeding}
            className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl font-medium transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
           >
             {seeding ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-database mr-2"></i>}
             {seeding ? "Adding Data..." : "Generate Demo Data"}
           </button>

           <div className="flex gap-4">
             <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex items-center flex-1 min-w-[140px]">
               <div className="p-2 bg-blue-50 rounded-lg mr-3">
                 <i className="fas fa-box text-blue-500"></i>
               </div>
               <div>
                 <p className="text-xs text-slate-500 uppercase font-bold">Total Items</p>
                 <p className="text-lg font-bold text-slate-800">{totalProducts}</p>
               </div>
             </div>
             <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex items-center flex-1 min-w-[140px]">
               <div className="p-2 bg-green-50 rounded-lg mr-3">
                 <i className="fas fa-dollar-sign text-green-500"></i>
               </div>
               <div>
                 <p className="text-xs text-slate-500 uppercase font-bold">Value</p>
                 <p className="text-lg font-bold text-slate-800">${totalValue.toLocaleString()}</p>
               </div>
             </div>
           </div>
        </div>
      </div>

      {/* Error & SQL Setup Guide */}
      {(setupRequired || error) && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-xl shadow-sm animate-fade-in">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <i className="fas fa-exclamation-circle text-red-500 mt-1"></i>
            </div>
            <div className="ml-3 w-full">
              <h3 className="text-lg font-bold text-red-800 mb-1">
                {setupRequired ? "Database Setup Required" : "Error"}
              </h3>
              <p className="text-sm text-red-700 mb-3">{error}</p>
              
              {setupRequired && (
                <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto shadow-inner border border-slate-700">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Copy & Run in Supabase SQL Editor</p>
                    <button 
                       onClick={() => navigator.clipboard.writeText(`create table if not exists public.products (
  id bigint generated by default as identity primary key,
  name text not null,
  price numeric not null,
  description text,
  image_url text,
  category text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true)
on conflict (id) do nothing;

alter table public.products enable row level security;
create policy "Public Access" on public.products for select using (true);
create policy "Public Insert" on public.products for insert with check (true);
create policy "Public Update" on public.products for update using (true);
create policy "Public Delete" on public.products for delete using (true);

create policy "Public Storage Select" on storage.objects for select using ( bucket_id = 'product-images' );
create policy "Public Storage Insert" on storage.objects for insert with check ( bucket_id = 'product-images' );`)}
                       className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded transition"
                    >
                      <i className="fas fa-copy mr-1"></i> Copy SQL
                    </button>
                  </div>
                  <pre className="text-green-400 text-xs font-mono whitespace-pre-wrap leading-relaxed">
{`-- 1. Create Products Table
create table if not exists public.products (
  id bigint generated by default as identity primary key,
  name text not null,
  price numeric not null,
  description text,
  image_url text,
  category text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Storage Bucket (Ignore error if exists)
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- 3. Enable Security Policies
alter table public.products enable row level security;

-- Allow everyone to read/write (For demo purposes)
create policy "Public Access" on public.products for select using (true);
create policy "Public Insert" on public.products for insert with check (true);
create policy "Public Update" on public.products for update using (true);
create policy "Public Delete" on public.products for delete using (true);

-- Storage Policies
create policy "Public Storage Select" on storage.objects for select using ( bucket_id = 'product-images' );
create policy "Public Storage Insert" on storage.objects for insert with check ( bucket_id = 'product-images' );`}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* AI Magic Import Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
               <i className="fas fa-magic text-9xl"></i>
             </div>
             <div className="relative z-10">
               <h3 className="text-lg font-bold mb-2 flex items-center">
                 <i className="fas fa-sparkles mr-2 text-yellow-300"></i> AI Auto-Import
               </h3>
               <p className="text-indigo-100 text-sm mb-4">
                 Upload a product photo and let Gemini Vision automatically fill in the details.
               </p>
               
               <button 
                 onClick={() => magicInputRef.current?.click()}
                 disabled={isAnalyzing}
                 className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl py-3 px-4 font-semibold text-white transition-all flex items-center justify-center"
               >
                 {isAnalyzing ? (
                   <>
                     <i className="fas fa-circle-notch fa-spin mr-2"></i> Analyzing...
                   </>
                 ) : (
                   <>
                     <i className="fas fa-camera mr-2"></i> Upload & Analyze
                   </>
                 )}
               </button>
               <input 
                 type="file" 
                 ref={magicInputRef} 
                 onChange={handleMagicUpload} 
                 className="hidden" 
                 accept="image/*"
               />
             </div>
          </div>

          {/* Main Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                {isEditing ? 'Edit Product' : 'Add New Product'}
              </h2>
              {isEditing && (
                <button 
                  onClick={resetForm}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded transition"
                >
                  Cancel
                </button>
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  placeholder="e.g. Modern Lamp"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    name="price"
                    required
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 focus:outline-none bg-white"
                  >
                    <option value="Home">Home</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Office">Office</option>
                    <option value="Art">Art</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 focus:outline-none resize-none"
                  placeholder="Product details..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Product Image</label>
                
                {/* Image Preview */}
                {formData.image_url && (
                  <div className="mb-3 relative group w-full h-40 bg-slate-100 rounded-lg overflow-hidden">
                    <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <p className="text-white text-xs font-medium">Current Image</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  />
                  {uploading && <i className="fas fa-spinner fa-spin text-primary"></i>}
                </div>
                <p className="text-xs text-slate-400 mt-1">Or paste a URL below</p>
                <input
                  type="text"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  placeholder="https://..."
                  className="w-full mt-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading || uploading}
                className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all flex justify-center items-center ${
                  isEditing 
                    ? 'bg-secondary hover:bg-green-600 shadow-green-500/20' 
                    : 'bg-primary hover:bg-indigo-600 shadow-indigo-500/20'
                } disabled:opacity-50`}
              >
                {loading ? (
                  <><i className="fas fa-spinner fa-spin mr-2"></i> Processing...</>
                ) : (
                  isEditing ? <><i className="fas fa-save mr-2"></i> Update Product</> : <><i className="fas fa-plus mr-2"></i> Add Product</>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Inventory List</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                        {loading ? (
                           <div className="flex justify-center"><i className="fas fa-spinner fa-spin text-2xl text-primary"></i></div>
                        ) : (
                           <>No products found in database.</>
                        )}
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100 mr-3 border border-slate-200">
                              <img className="h-full w-full object-cover" src={product.image_url || 'https://via.placeholder.com/100'} alt="" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-slate-900">{product.name}</div>
                              <div className="text-xs text-slate-500 truncate max-w-[150px]">{product.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-600">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-700">
                          ${Number(product.price).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button 
                            onClick={() => handleEditClick(product)}
                            className="text-slate-400 hover:text-blue-500 transition-colors"
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            onClick={() => handleDelete(product.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors"
                            title="Delete"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductManager;
