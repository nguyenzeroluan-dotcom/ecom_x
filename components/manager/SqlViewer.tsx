
import React, { useState } from 'react';
import { INITIAL_SETUP_SQL } from '../../data/01_initial_setup';
import { USER_RBAC_SQL } from '../../data/02_user_rbac';
import { ROLES_PERMISSIONS_SQL } from '../../data/03_roles_permissions';
import { INVENTORY_ADVANCED_SQL } from '../../data/04_inventory_advanced';
import { MEDIA_MANAGER_SQL } from '../../data/05_media_manager';
import { MEDIA_COLLECTIONS_SQL } from '../../data/07_media_collections';
import { EBOOKS_SETUP_SQL } from '../../data/08_ebooks_setup';
import { GALLERY_VIEW_FIX_SQL } from '../../data/09_gallery_view_fix';
import { VIDEO_URL_SUPPORT_SQL } from '../../data/10_video_url_support';
import { EBOOKS_ADVANCED_SQL } from '../../data/11_ebooks_advanced';
import { ORDER_MANAGEMENT_SQL } from '../../data/12_order_management';
import { LIBRARY_SYNC_SQL } from '../../data/13_library_sync';
import { ADMIN_LIBRARY_ACCESS_SQL } from '../../data/14_admin_library_access';
import { DEMO_ADMIN_SUPPORT_SQL } from '../../data/15_demo_admin_support';
import { LIBRARY_RLS_FIX_SQL } from '../../data/16_library_rls_fix';
import { FIX_FULFILLMENT_RLS_SQL } from '../../data/17_fix_fulfillment_rls';
import { ORDER_ARCHIVING_SQL } from '../../data/20_order_archiving';
import { WISHLIST_SETUP_SQL } from '../../data/21_wishlist_setup';
import { useNotification } from '../../contexts/NotificationContext';

interface ScriptItemProps {
    script: {
        title: string;
        description: string;
        sql: string;
        color: string;
        label: string;
    };
    onCopy: (text: string, label: string) => void;
}

const ScriptItem: React.FC<ScriptItemProps> = ({ script, onCopy }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm transition-all duration-200 hover:shadow-md">
            <div 
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0 ${script.color}`}>
                        <i className="fas fa-database"></i>
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-slate-800 dark:text-white">{script.title}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{script.description}</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onCopy(script.sql, script.label); }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-2"
                        title="Copy to Clipboard"
                    >
                        <i className="fas fa-copy"></i> <span className="hidden sm:inline">Copy</span>
                    </button>
                    <div className={`w-8 h-8 flex items-center justify-center text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                        <i className="fas fa-chevron-down"></i>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-900 animate-fade-in">
                    <div className="flex justify-between items-center px-4 py-2 bg-black/20 border-b border-white/5">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">SQL Script Content</span>
                    </div>
                    <div className="p-4 overflow-x-auto max-h-[400px] custom-scrollbar">
                        <pre className={`${script.color} text-xs font-mono whitespace-pre-wrap leading-relaxed`}>
                            {script.sql}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
};

const SqlViewer: React.FC = () => {
  const { addNotification } = useNotification();

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addNotification('success', `${label} SQL copied to clipboard!`);
  };

  const scripts = [
    {
      title: '1. Core Schema (Products, Orders)',
      description: 'Required for basic app functionality.',
      sql: INITIAL_SETUP_SQL,
      color: 'text-green-400',
      label: 'Core'
    },
    {
      title: '2. User Management & RBAC',
      description: 'Required for user profiles, avatars, and admin permissions.',
      sql: USER_RBAC_SQL,
      color: 'text-blue-400',
      label: 'RBAC'
    },
    {
      title: '3. Advanced Roles & Permissions',
      description: 'Required for custom role definitions.',
      sql: ROLES_PERMISSIONS_SQL,
      color: 'text-purple-400',
      label: 'Roles'
    },
    {
      title: '4. Advanced Inventory (Logs & SKU)',
      description: 'Required for audit logs and SKU tracking.',
      sql: INVENTORY_ADVANCED_SQL,
      color: 'text-orange-400',
      label: 'Inventory'
    },
    {
      title: '5. Media Library (Assets Schema)',
      description: 'Required for central media management.',
      sql: MEDIA_MANAGER_SQL,
      color: 'text-yellow-400',
      label: 'Media'
    },
    {
      title: '6. Media Collections (Galleries)',
      description: 'Required for product image galleries.',
      sql: MEDIA_COLLECTIONS_SQL,
      color: 'text-pink-400',
      label: 'Collections'
    },
    {
      title: '7. E-Books & Library System',
      description: 'Required for Digital Products and Reader functionality.',
      sql: EBOOKS_SETUP_SQL,
      color: 'text-cyan-400',
      label: 'E-Books'
    },
    {
      title: '8. Gallery View Fix',
      description: 'Ensures gallery_images persistence.',
      sql: GALLERY_VIEW_FIX_SQL,
      color: 'text-teal-400',
      label: 'Gallery Fix'
    },
    {
      title: '9. Video URL Support',
      description: 'Adds video_url column to products.',
      sql: VIDEO_URL_SUPPORT_SQL,
      color: 'text-indigo-400',
      label: 'Video Support'
    },
    {
        title: '10. Advanced E-Book Manager',
        description: 'Enables PDF upload, storage bucket setup, and simplified permissions.',
        sql: EBOOKS_ADVANCED_SQL,
        color: 'text-rose-400',
        label: 'Adv. E-Books'
    },
    {
        title: '11. Order Management',
        description: 'Adds tracking numbers and admin update permissions.',
        sql: ORDER_MANAGEMENT_SQL,
        color: 'text-emerald-400',
        label: 'Orders'
    },
    {
        title: '12. Library Sync Fix',
        description: 'Links orders to products for reliable library synchronization.',
        sql: LIBRARY_SYNC_SQL,
        color: 'text-lime-400',
        label: 'Sync Fix'
    },
    {
        title: '13. Admin Library Access',
        description: 'Allow Admins to fulfill digital orders.',
        sql: ADMIN_LIBRARY_ACCESS_SQL,
        color: 'text-amber-400',
        label: 'Admin Access'
    },
    {
        title: '14. Demo Admin Support',
        description: 'Seeds the Demo User into the database.',
        sql: DEMO_ADMIN_SUPPORT_SQL,
        color: 'text-gray-400',
        label: 'Demo Seed'
    },
    {
        title: '15. Demo Library RLS Fix',
        description: 'Fixes view permissions for the Demo Admin.',
        sql: LIBRARY_RLS_FIX_SQL,
        color: 'text-red-400',
        label: 'View Fix'
    },
    {
        title: '16. Demo Fulfillment Fix',
        description: 'Fixes "new row violates RLS" error when fulfilling orders.',
        sql: FIX_FULFILLMENT_RLS_SQL,
        color: 'text-red-500',
        label: 'Insert Fix'
    },
    {
        title: '17. Order Archiving',
        description: 'Tables for "Soft Delete" functionality.',
        sql: ORDER_ARCHIVING_SQL,
        color: 'text-pink-500',
        label: 'Archiving'
    },
    {
        title: '18. Wishlist Sync (New)',
        description: 'Table for persistent wishlist storage.',
        sql: WISHLIST_SETUP_SQL,
        color: 'text-violet-400',
        label: 'Wishlist'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <i className="fas fa-database text-xl"></i>
            </div>
            <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Database Setup Center</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    Run these scripts in the <a href="https://supabase.com/dashboard/project/_/sql" target="_blank" rel="noreferrer" className="text-primary hover:underline font-bold">Supabase SQL Editor</a> to initialize your database.
                </p>
            </div>
        </div>

        <div className="flex flex-col gap-4">
            {scripts.map(script => (
                <ScriptItem key={script.title} script={script} onCopy={handleCopy} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default SqlViewer;
