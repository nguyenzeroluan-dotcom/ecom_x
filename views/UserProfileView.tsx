import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { uploadMediaAsset } from '../services/mediaService';
import { DATABASE_SETUP_SQL } from '../services/databaseService';
import OrdersView from './OrdersView';
import { ViewState } from '../types';

interface UserProfileViewProps {
    setView: (view: ViewState) => void;
}

const UserProfileView: React.FC<UserProfileViewProps> = ({ setView }) => {
  const { user, updateProfile, signOut } = useAuth();
  const { addNotification } = useNotification();
  const [activeTab, setActiveTab] = useState<'info' | 'orders'>('info');
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
      full_name: '',
      phone: '',
      address: '',
      city: '',
      ai_style_preference: 'Balanced'
  });
  
  useEffect(() => {
      if (user) {
          setFormData({
              full_name: user.full_name || '',
              phone: user.phone || '',
              address: user.address || '',
              city: user.city || '',
              ai_style_preference: user.ai_style_preference || 'Balanced'
          });
      }
  }, [user, isEditing]);

  if (!user) {
      return (
          <div className="flex flex-col items-center justify-center h-[60vh]">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Please Sign In</h2>
              <p className="text-slate-500 mb-6">You need to be logged in to view your profile.</p>
              <button onClick={() => setView(ViewState.HOME)} className="text-primary font-bold underline">Go Home</button>
          </div>
      );
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
          setUploading(true);
          try {
              // FIX: Use the 'public_url' property from the returned asset object
              const asset = await uploadMediaAsset(e.target.files[0], user?.id, 'avatars');
              await updateProfile({ avatar_url: asset.public_url });
          } catch (err: any) {
              addNotification('error', 'Upload failed: ' + err.message);
          } finally {
              setUploading(false);
          }
      }
  };

  const handleSave = async () => {
      await updateProfile(formData);
      setIsEditing(false);
  };

  const InfoField = ({ label, value }: {label: string, value: string}) => (
      <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{label}</label>
          <p className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-800 dark:text-slate-200">{value || <span className="italic text-slate-400">Not set</span>}</p>
      </div>
  );

  const EditField = ({ label, name, value, onChange }: {label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void}) => (
      <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{label}</label>
          <input 
            name={name}
            value={value}
            onChange={onChange}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-3 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/50 outline-none"
          />
      </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-slate-100 dark:bg-slate-950">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Sidebar */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 text-center sticky top-24">
                    <div className="relative group w-32 h-32 mx-auto mb-4">
                        <img src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.email}`} alt="Avatar" className="w-full h-full object-cover rounded-full border-4 border-white dark:border-slate-900 shadow-lg" />
                        <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            {uploading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-camera"></i>}
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">{user.full_name || 'Valued Customer'}</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-2 sticky top-64">
                  <button onClick={() => setActiveTab('info')} className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-colors flex items-center gap-3 ${activeTab === 'info' ? 'bg-primary text-white shadow-lg' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                      <i className="fas fa-user-circle w-6"></i> Profile
                  </button>
                  <button onClick={() => setActiveTab('orders')} className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-colors flex items-center gap-3 ${activeTab === 'orders' ? 'bg-primary text-white shadow-lg' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                      <i className="fas fa-box-open w-6"></i> Orders
                  </button>
                </div>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-3">
                {activeTab === 'info' && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 animate-fade-in">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Personal Information</h2>
                            {!isEditing ? (
                                <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-lg hover:bg-slate-200">Edit</button>
                            ) : (
                                <div className="flex gap-3">
                                    <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-bold rounded-lg">Cancel</button>
                                    <button onClick={handleSave} className="px-4 py-2 bg-secondary text-white text-sm font-bold rounded-lg shadow-lg">Save</button>
                                </div>
                            )}
                        </div>
                        
                        {isEditing ? (
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <EditField label="Full Name" name="full_name" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
                                <EditField label="Phone" name="phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                                <div className="md:col-span-2">
                                  <EditField label="Address" name="address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                                </div>
                                <EditField label="City" name="city" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">AI Recommendation Style</label>
                                    <select value={formData.ai_style_preference} onChange={e => setFormData({...formData, ai_style_preference: e.target.value})} className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-3 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/50 outline-none">
                                        <option>Balanced</option>
                                        <option>Adventurous</option>
                                        <option>Minimalist</option>
                                        <option>Budget-Conscious</option>
                                        <option>Luxury</option>
                                    </select>
                                </div>
                             </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InfoField label="Full Name" value={user.full_name || ''} />
                                <InfoField label="Phone" value={user.phone || ''} />
                                <div className="md:col-span-2"><InfoField label="Address" value={user.address || ''} /></div>
                                <InfoField label="City" value={user.city || ''} />
                                <InfoField label="AI Style Preference" value={user.ai_style_preference || ''} />
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'orders' && <OrdersView setView={setView} />}
            </div>
        </div>
    </div>
  );
};

export default UserProfileView;
