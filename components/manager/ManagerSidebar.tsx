import React from 'react';
import { ManagerTab, UserProfile } from '../../types';

interface ManagerSidebarProps {
    tabs: { id: ManagerTab, label: string, icon: string, adminOnly: boolean }[];
    activeTab: ManagerTab;
    setActiveTab: (tab: ManagerTab) => void;
    user: UserProfile;
    signOut: () => void;
    isAdmin: boolean;
}

const ManagerSidebar: React.FC<ManagerSidebarProps> = ({ tabs, activeTab, setActiveTab, user, signOut, isAdmin }) => {
    
    const visibleTabs = tabs.filter(tab => !tab.adminOnly || isAdmin);

    const navLinks = visibleTabs.map(tab => (
        <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors
                ${activeTab === tab.id 
                    ? 'bg-primary/10 text-primary dark:bg-primary/20' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }
            `}
        >
            <i className={`fas ${tab.icon} w-5 text-center ${activeTab === tab.id ? 'text-primary' : 'text-slate-400'}`}></i>
            <span>{tab.label}</span>
        </button>
    ));

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="fixed top-0 left-0 z-40 w-64 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 hidden lg:flex flex-col">
                <div className="flex items-center h-16 px-6 border-b border-slate-200 dark:border-slate-800">
                     <div className="bg-gradient-to-br from-primary to-indigo-600 text-white p-2 rounded-lg mr-3 shadow-lg shadow-indigo-500/20">
                        <i className="fas fa-cube text-xl"></i>
                    </div>
                    <span className="font-bold text-xl text-slate-800 dark:text-white tracking-tight font-display">NexusAdmin</span>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    {navLinks}
                </nav>
                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <img src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.email}`} alt="Admin" className="w-10 h-10 rounded-full object-cover"/>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-slate-800 dark:text-white truncate">{user?.full_name || 'Admin'}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        </div>
                        <button onClick={signOut} title="Sign Out" className="text-slate-400 hover:text-red-500 transition-colors">
                            <i className="fas fa-sign-out-alt"></i>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Top Bar */}
            <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-[64px] z-30">
                 <div className="px-2 py-2 overflow-x-auto no-scrollbar">
                    <nav className="flex space-x-2">
                        {visibleTabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-shrink-0 px-3 py-2 rounded-md text-xs font-bold flex items-center gap-2 ${activeTab === tab.id ? 'bg-primary/10 text-primary' : 'text-slate-500'}`}
                            >
                                <i className={`fas ${tab.icon}`}></i> {tab.label}
                            </button>
                        ))}
                    </nav>
                 </div>
            </div>
        </>
    );
};

export default ManagerSidebar;
