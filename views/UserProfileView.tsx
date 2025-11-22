
import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { uploadProductImage, DATABASE_SETUP_SQL } from '../services/supabaseClient';
import OrdersView from './OrdersView';
import { ViewState } from '../types';

interface UserProfileViewProps {
    setView: (view: ViewState) => void;
}

const UserProfileView: React.FC<UserProfileViewProps> = ({ setView }) => {
  const { user, updateProfile, signOut } = useAuth();
  const { addNotification } = useNotification();
  const [activeTab, setActiveTab] = useState<'info' | 'orders' | 'settings'>('info');
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Local state for editing
  const [formData, setFormData] = useState({
      full_name: user?.full_name || '',
      phone: user?.phone || '',
      address: user?.address || '',
      city: user?.city || '',
      ai_style_preference: user?.ai_style_preference || 'Balanced'
  });

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
              const url = await uploadProductImage(e.target.files[0], 'avatars');
              await updateProfile({ avatar_url: url });
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

  const handleCopySQL = () => {
      navigator.clipboard.writeText(DATABASE_SETUP_SQL);
      addNotification('success', 'SQL copied to clipboard');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 mb-8 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
         <div className="relative flex flex-col md:flex-row items-end md:items-center gap-6 mt-12">
             <div className="relative group">
                 <div className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 bg-slate-200 overflow-hidden shadow-lg">
                     <img src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.email}`} alt="Avatar" className="w-full h-full object-cover" />
                 </div>
                 <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                 >
                     {uploading ? <i className="fas fa-spinner fa-spin text-xs"></i> : <i className="fas fa-camera text-xs"></i>}
                 </button>
                 <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
             </div>
             
             <div className="flex-1 mb-2">
                 <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{user.full_name || 'Explorer'}</h1>
                 <p className="text-slate-500 dark:text-slate-400">{user.email}</p>
                 <div className="flex items-center gap-2 mt-2">
                    <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-xs font-bold rounded-full">
                        AI Style: {user.ai_style_preference || 'Not Set'}
                    </span>
                 </div>
             </div>

             <div className="flex gap-3">
                 <button 
                    onClick={signOut} 
                    className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                 >
                    Sign Out
                 </button>
             </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="col-span-1">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-2 sticky top-24">
                  <button 
                    onClick={() => setActiveTab('info')}
                    className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-colors flex items-center gap-3 ${activeTab === 'info' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                  >
                      <i className="fas fa-user-circle w-6"></i> Personal Info
                  </button>
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-colors flex items-center gap-3 ${activeTab === 'orders' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                  >
                      <i className="fas fa-box-open w-6"></i> Order History
                  </button>
                  <button 
                    onClick={() => setActiveTab('settings')}
                    className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-colors flex items-center gap-3 ${activeTab === 'settings' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                  >
                      <i className="fas fa-cog w-6"></i> Settings & DB
                  </button>
              </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
              {activeTab === 'info' && (
                  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-8 animate-fade-in">
                      <div className="flex justify-between items-center mb-6">
                          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Personal Information</h2>
                          {!isEditing ? (
                              <button onClick={() => setIsEditing(true)} className="text-primary font-bold text-sm hover:underline">Edit Profile</button>
                          ) : (
                              <div className="flex gap-3">
                                  <button onClick={() => setIsEditing(false)} className="text-slate-500 font-bold text-sm hover:text-slate-700">Cancel</button>
                                  <button onClick={handleSave} className="text-green-600 font-bold text-sm hover:underline">Save Changes</button>
                              </div>
                          )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                              <input 
                                disabled={!isEditing}
                                value={formData.full_name}
                                onChange={e => setFormData({...formData, full_name: e.target.value})}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/50 outline-none disabled:opacity-60"
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                              <input 
                                disabled={!isEditing}
                                value={formData.phone}
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/50 outline-none disabled:opacity-60"
                              />
                          </div>
                          <div className="md:col-span-2">
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Address</label>
                              <input 
                                disabled={!isEditing}
                                value={formData.address}
                                onChange={e => setFormData({...formData, address: e.target.value})}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/50 outline-none disabled:opacity-60"
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">City</label>
                              <input 
                                disabled={!isEditing}
                                value={formData.city}
                                onChange={e => setFormData({...formData, city: e.target.value})}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/50 outline-none disabled:opacity-60"
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">AI Recommendation Style</label>
                              <select 
                                disabled={!isEditing}
                                value={formData.ai_style_preference}
                                onChange={e => setFormData({...formData, ai_style_preference: e.target.value})}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/50 outline-none disabled:opacity-60"
                              >
                                  <option>Balanced</option>
                                  <option>Adventurous</option>
                                  <option>Minimalist</option>
                                  <option>Budget-Conscious</option>
                                  <option>Luxury</option>
                              </select>
                          </div>
                      </div>
                  </div>
              )}

              {activeTab === 'orders' && (
                  <div className="animate-fade-in">
                      <OrdersView setView={setView} />
                  </div>
              )}

              {activeTab === 'settings' && (
                  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-8 animate-fade-in">
                      <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Account & Database</h2>
                      
                      <div className="mb-8">
                          <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-2">Database Setup</h3>
                          <p className="text-sm text-slate-500 mb-4">
                              If you are encountering errors with the User Profile or Orders, you may need to update your Supabase database schema.
                          </p>
                          <button 
                            onClick={handleCopySQL}
                            className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                          >
                              <i className="fas fa-copy mr-2"></i> Copy SQL Setup Script
                          </button>
                      </div>

                      <div className="border-t border-slate-100 dark:border-slate-700 pt-6">
                          <h3 className="font-bold text-red-500 mb-2">Danger Zone</h3>
                          <button className="text-red-600 border border-red-200 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                              Delete Account
                          </button>
                      </div>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default UserProfileView;
