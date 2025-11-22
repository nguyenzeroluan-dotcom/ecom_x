
import React from 'react';
import { ManagerTab, UserProfile } from '../../types';

interface ManagerSidebarProps {
    tabs: { id: ManagerTab, label: string, icon: string, adminOnly: boolean }[];
    activeTab: ManagerTab;
    setActiveTab: (tab: ManagerTab) => void;
    user: UserProfile;
    signOut: () => void;
    isAdmin: boolean;
    isCollapsed: boolean;
    setIsCollapsed: (isCollapsed: boolean) => void;
}

const ManagerSidebar: React.FC<ManagerSidebarProps> = ({ tabs, activeTab, setActiveTab, user, signOut, isAdmin, isCollapsed, setIsCollapsed }) => {
    
    const visibleTabs = tabs.filter(tab => !tab.adminOnly || isAdmin);

    const navLinks = visibleTabs.map(tab => (
        <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 group relative
                ${activeTab === tab.id 
                    ? 'bg-primary/10 text-primary dark:bg-primary/20' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }
            `}
        >
            <i className={`fas ${tab.icon} w-5 text-center text-lg transition-colors ${activeTab === tab.id ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}></i>
            <span className={`transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>{tab.label}</span>
             {isCollapsed && (
                <span className="absolute left-full ml-4 w-auto p-2 text-xs font-medium text-white bg-slate-800 rounded-md shadow-md
                                 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50">
                    {tab.label}
                </span>
            )}
        </button>
    ));

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className={`fixed top-0 left-0 z-40 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 hidden lg:flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
                <div className="flex items-center h-16 px-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
                     <div className="bg-gradient-to-br from-primary to-indigo-600 text-white p-2 rounded-lg shadow-lg shadow-indigo-500/20">
                        <i className="fas fa-cube text-xl"></i>
                    </div>
                    {!isCollapsed && <span className="ml-3 font-bold text-xl text-slate-800 dark:text-white tracking-tight font-display transition-opacity duration-200">NexusAdmin</span>}
                </div>
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto overflow-x-hidden">
                    {navLinks}
                </nav>
                <div className={`p-4 border-t border-slate-200 dark:border-slate-800 transition-all duration-300 ${isCollapsed ? 'py-2.5' : 'py-4'}`}>
                    <div className={`flex items-center gap-3 transition-all duration-300 ${isCollapsed ? 'justify-center' : ''}`}>
                        <img src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.email}`} alt="Admin" className="w-10 h-10 rounded-full object-cover shrink-0"/>
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm text-slate-800 dark:text-white truncate">{user?.full_name || 'Admin'}</p>
                                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                            </div>
                        )}
                        <button onClick={signOut} title="Sign Out" className={`text-slate-400 hover:text-red-500 transition-colors ${isCollapsed ? 'hidden' : ''}`}>
                            <i className="fas fa-sign-out-alt"></i>
                        </button>
                    </div>
                </div>
                <div className="p-2 border-t border-slate-200 dark:border-slate-800">
                     <button 
                        onClick={() => setIsCollapsed(!isCollapsed)} 
                        className="w-full h-10 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                     >
                        <i className={`fas transition-transform duration-300 ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
                    </button>
                </div>
            </aside>

            {/* Mobile Top Bar */}
            <div className={`lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30`}>
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