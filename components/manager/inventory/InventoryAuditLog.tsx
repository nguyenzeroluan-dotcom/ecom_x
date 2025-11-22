import React, { useState, useEffect } from 'react';
import { getInventoryLogs } from '../../../services/supabaseClient';
import { InventoryLog } from '../../../types';

const InventoryAuditLog: React.FC = () => {
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getInventoryLogs();
        setLogs(data);
      } catch (err: any) {
        setError("Failed to load audit logs. " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const getReasonBadge = (reason: string) => {
    switch(reason) {
      case 'sale': return 'bg-red-100 text-red-700';
      case 'restock': return 'bg-green-100 text-green-700';
      case 'adjustment': return 'bg-blue-100 text-blue-700';
      case 'damage': return 'bg-orange-100 text-orange-700';
      case 'return': return 'bg-purple-100 text-purple-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const renderContent = () => {
    if (loading) {
      return <div className="text-center py-20"><i className="fas fa-spinner fa-spin text-primary text-2xl"></i></div>;
    }
    if (error) {
      return <div className="text-center py-20 text-red-500">{error}</div>;
    }
    if (logs.length === 0) {
      return (
        <div className="text-center py-20 text-slate-400">
          <i className="fas fa-history text-4xl mb-3"></i>
          <p>No inventory changes have been logged yet.</p>
        </div>
      );
    }
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Date</th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Product</th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Change</th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Reason</th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {logs.map(log => (
              <tr key={log.id}>
                <td className="px-6 py-4 text-sm text-slate-500">{new Date(log.created_at).toLocaleString()}</td>
                <td className="px-6 py-4 font-medium text-slate-800 dark:text-white">{log.product_name}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">{log.previous_stock}</span>
                    <i className="fas fa-arrow-right text-xs text-slate-400"></i>
                    <span className="font-bold text-lg text-slate-800 dark:text-white">{log.new_stock}</span>
                    <span className={`font-bold ${log.change_amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ({log.change_amount > 0 ? '+' : ''}{log.change_amount})
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${getReasonBadge(log.reason)}`}>
                    {log.reason}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500 italic">{log.note || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      {renderContent()}
    </div>
  );
};

export default InventoryAuditLog;
