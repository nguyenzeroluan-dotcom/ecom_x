

import React from 'react';
import { INITIAL_SETUP_SQL } from '../../data/01_initial_setup';
import { USER_RBAC_SQL } from '../../data/02_user_rbac';
import { ROLES_PERMISSIONS_SQL } from '../../data/03_roles_permissions';
import { INVENTORY_ADVANCED_SQL } from '../../data/04_inventory_advanced';
import { MEDIA_MANAGER_SQL } from '../../data/05_media_manager';
import { useNotification } from '../../contexts/NotificationContext';

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
      title: '5. Media Library (v2 Schema)',
      description: 'Required for central media management. Includes dimensions, tags, etc.',
      sql: MEDIA_MANAGER_SQL,
      color: 'text-yellow-400',
      label: 'Media'
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
                    Use these scripts in the <a href="https://supabase.com/dashboard/project/_/sql" target="_blank" rel="noreferrer" className="text-primary hover:underline font-bold">Supabase SQL Editor</a> to initialize your database tables and security policies.
                </p>
            </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
            {scripts.map(script => (
                <div key={script.title} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                    <div className="bg-slate-50 dark:bg-slate-900 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm">{script.title}</h3>
                            <p className="text-xs text-slate-500">{script.description}</p>
                        </div>
                        <button 
                            onClick={() => handleCopy(script.sql, script.label)}
                            className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-2"
                        >
                            <i className="fas fa-copy"></i> Copy Script
                        </button>
                    </div>
                    <div className="bg-slate-900 p-4 overflow-x-auto max-h-[200px] custom-scrollbar">
                        <pre className={`${script.color} text-xs font-mono whitespace-pre-wrap leading-relaxed`}>
                            {script.sql}
                        </pre>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default SqlViewer;