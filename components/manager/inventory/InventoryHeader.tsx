import React from 'react';
import StatsCard from '../../common/StatsCard';
import { InvViewMode } from '../InventoryManager';

interface InventoryHeaderProps {
  stats: {
    totalItems: number;
    totalValue: number;
    lowStockCount: number;
    outOfStockCount: number;
  };
  activeTab: 'overview' | 'audit';
  setActiveTab: (tab: 'overview' | 'audit') => void;
  search: string;
  setSearch: (value: string) => void;
  viewMode: InvViewMode;
  setViewMode: (mode: InvViewMode) => void;
}

const InventoryHeader: React.FC<InventoryHeaderProps> = ({
  stats,
  activeTab,
  setActiveTab,
  search,
  setSearch,
  viewMode,
  setViewMode,
}) => {
  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard title="Total SKUs" value={stats.totalItems} icon="fa-boxes" colorClass="text-blue-500" bgClass="bg-blue-50" />
        <StatsCard title="Inventory Value" value={`$${stats.totalValue.toLocaleString()}`} icon="fa-dollar-sign" colorClass="text-green-500" bgClass="bg-green-50" />
        <StatsCard title="Low Stock" value={stats.lowStockCount} icon="fa-exclamation-triangle" colorClass="text-orange-500" bgClass="bg-orange-50" />
        <StatsCard title="Out of Stock" value={stats.outOfStockCount} icon="fa-times-circle" colorClass="text-red-500" bgClass="bg-red-50" />
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'overview' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'audit' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Audit Logs
          </button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1">
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
            <input
              type="text"
              placeholder="Search by name, SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/50 outline-none"
            />
          </div>
          {activeTab === 'overview' && (
            <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-1">
              <button onClick={() => setViewMode('table')} className={`p-2 rounded-lg ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-400'}`}><i className="fas fa-table"></i></button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-400'}`}><i className="fas fa-list"></i></button>
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-400'}`}><i className="fas fa-th-large"></i></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryHeader;
