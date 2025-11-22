import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, UserRole } from '../../types';
import { uploadMediaAsset } from '../../services/mediaService';

interface UserFormProps {
  initialData?: UserProfile | null;
  onSubmit: (data: Partial<UserProfile>) => Promise<boolean>;
  onCancel: () => void;
  isEditing: boolean;
  isLoading: boolean;
}

const UserForm: React.FC<UserFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEditing,
  isLoading
}) => {
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    role: 'customer' as UserRole,
    phone: '',
    city: '',
    avatar_url: ''
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        email: initialData.email,
        full_name: initialData.full_name || '',
        role: initialData.role || 'customer',
        phone: initialData.phone || '',
        city: initialData.city || '',
        avatar_url: initialData.avatar_url || ''
      });
    } else {
      setFormData({ email: '', full_name: '', role: 'customer', phone: '', city: '', avatar_url: '' });
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
        setUploading(true);
        try {
            // FIX: Use the 'public_url' property from the returned asset object
            const asset = await uploadMediaAsset(e.target.files[0], undefined, 'avatars');
            setFormData(prev => ({ ...prev, avatar_url: asset.public_url }));
        } catch (err: any) {
            alert("Upload failed: " + err.message);
        } finally {
            setUploading(false);
        }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sticky top-24">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">{isEditing ? 'Edit User' : 'Add New User'}</h2>
          <button onClick={onCancel} className="text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-300 px-2 py-1 rounded transition">Cancel</button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-24 h-24 rounded-full border-4 border-slate-100 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-900">
                    {formData.avatar_url ? (
                        <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <i className="fas fa-user text-4xl"></i>
                        </div>
                    )}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <i className="fas fa-camera text-white"></i>
                </div>
                {uploading && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 rounded-full flex items-center justify-center">
                        <i className="fas fa-spinner fa-spin text-primary"></i>
                    </div>
                )}
            </div>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs text-primary font-bold mt-2 hover:underline">
                {isEditing ? 'Change Photo' : 'Upload Photo'}
            </button>
            <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
            <input 
                type="text" 
                name="full_name" 
                required 
                value={formData.full_name} 
                onChange={handleInputChange} 
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 focus:outline-none dark:bg-slate-900 dark:text-white" 
                placeholder="John Doe" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
            <input 
                type="email" 
                name="email" 
                required 
                value={formData.email} 
                onChange={handleInputChange} 
                disabled={isEditing} 
                className={`w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 focus:outline-none dark:bg-slate-900 dark:text-white ${isEditing ? 'opacity-60 cursor-not-allowed' : ''}`} 
                placeholder="john@example.com" 
            />
          </div>

          <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Role (Permission Level)</label>
            <select 
                name="role" 
                value={formData.role} 
                onChange={handleInputChange} 
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 focus:outline-none bg-white dark:bg-slate-900 dark:text-white mb-2"
            >
                <option value="customer">Customer</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
            </select>
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2">
                <i className="fas fa-info-circle mt-0.5"></i>
                <p>
                    {formData.role === 'admin' && "Full system access. Can manage users, products, and settings."}
                    {formData.role === 'manager' && "Store management access. Can edit products/orders but cannot manage users."}
                    {formData.role === 'customer' && "Standard access. Can only view products and manage their own personal orders."}
                </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
              <input 
                type="text" 
                name="phone" 
                value={formData.phone} 
                onChange={handleInputChange} 
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 focus:outline-none dark:bg-slate-900 dark:text-white" 
                placeholder="+1 234..." 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">City</label>
              <input 
                type="text" 
                name="city" 
                value={formData.city} 
                onChange={handleInputChange} 
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 focus:outline-none dark:bg-slate-900 dark:text-white" 
                placeholder="New York" 
              />
            </div>
          </div>

          <button type="submit" disabled={isLoading || uploading} className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all flex justify-center items-center ${isEditing ? 'bg-secondary hover:bg-green-600 shadow-green-500/20' : 'bg-primary hover:bg-indigo-600 shadow-indigo-500/20'} disabled:opacity-50`}>
            {isLoading ? <><i className="fas fa-spinner fa-spin mr-2"></i> Processing...</> : isEditing ? <><i className="fas fa-save mr-2"></i> Update User</> : <><i className="fas fa-user-plus mr-2"></i> Add User</>}
          </button>
        </form>
    </div>
  );
};

export default UserForm;
