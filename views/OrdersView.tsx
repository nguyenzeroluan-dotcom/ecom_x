import React, { useEffect, useState } from 'react';
import { getOrders } from '../services/orderService';
import { DATABASE_SETUP_SQL } from '../services/databaseService';
import { Order } from '../types';
import { ViewState } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface OrdersViewProps {
  setView: (view: ViewState) => void;
}

const OrdersView: React.FC<OrdersViewProps> = ({ setView }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [setupRequired, setSetupRequired] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        // Fetch by ID (if real UUID) or by email (for demo user/guest)
        const data = await getOrders(user?.id, user?.email);
        setOrders(data);
        setError(null);
        setSetupRequired(false);
      } catch (err: any) {
        console.error("Fetch orders failed", err);
        setError(err.message);
        if (err.message?.includes('column orders.user_id does not exist') || 
            err.message?.includes('does not exist') || 
            err.message?.includes('42703')) {
            setSetupRequired(true);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  if (loading) {
      return (
          <div className="flex justify-center items-center h-[30vh]">
              <i className="fas fa-circle-notch fa-spin text-4xl text-primary"></i>
          </div>
      );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Orders</h1>
          {/* Only show back button if NOT embedded in Profile View (context check or simple conditional) */}
          <button 
            onClick={() => setView(ViewState.HOME)}
            className="text-primary font-medium hover:underline"
          >
            Shop More
          </button>
      </div>

      {setupRequired ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-xl shadow-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <i className="fas fa-database text-red-500 mt-1"></i>
                </div>
                <div className="ml-3 w-full">
                  <h3 className="text-lg font-bold text-red-800 mb-1">Database Update Required</h3>
                  <p className="text-sm text-red-700 mb-3">
                      Your database is missing the `user_id` column on the `orders` table. Please run this SQL in the Supabase SQL Editor to fix it.
                  </p>
                  <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto shadow-inner border border-slate-700">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-400 text-xs font-bold">SQL SCRIPT</span>
                        <button 
                          onClick={() => navigator.clipboard.writeText(DATABASE_SETUP_SQL)}
                          className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded transition flex items-center gap-2"
                        >
                            <i className="fas fa-copy"></i> Copy Full SQL
                        </button>
                      </div>
                      <pre className="text-green-400 text-xs font-mono whitespace-pre-wrap">
{DATABASE_SETUP_SQL}
                      </pre>
                  </div>
                </div>
              </div>
          </div>
      ) : error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100">
              <i className="fas fa-exclamation-circle mr-2"></i>
              Unable to load orders: {error}
          </div>
      )}

      {!setupRequired && orders.length === 0 && !error ? (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 animate-fade-in">
              <div className="w-24 h-24 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-small">
                  <i className="fas fa-box-open text-4xl text-slate-400 dark:text-slate-500"></i>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 font-display">No Orders Yet</h3>
              <p className="text-slate-500 mb-6">Your past orders will appear here once you've made a purchase.</p>
              <button 
                  onClick={() => setView(ViewState.HOME)}
                  className="bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/30 hover:bg-indigo-600 transition-all"
              >
                  Browse Products
              </button>
          </div>
      ) : (
          <div className="space-y-6">
              {orders.map((order) => (
                  <div key={order.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in-up">
                      {/* Order Header */}
                      <div className="bg-slate-50 dark:bg-slate-900 p-4 md:p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex gap-6">
                              <div>
                                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">Order Placed</p>
                                  <p className="text-slate-800 dark:text-slate-200 font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                              </div>
                              <div>
                                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">Total</p>
                                  <p className="text-slate-800 dark:text-slate-200 font-medium">${Number(order.total_amount).toFixed(2)}</p>
                              </div>
                              <div>
                                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">Ship To</p>
                                  <p className="text-slate-800 dark:text-slate-200 font-medium">{order.customer_name}</p>
                              </div>
                          </div>
                          <div className="flex items-center gap-3">
                              <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${
                                  order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                  {order.status}
                              </span>
                              <p className="text-xs text-slate-400 font-mono">#{order.id}</p>
                          </div>
                      </div>

                      {/* Order Content */}
                      <div className="p-4 md:p-6">
                          {order.ai_note && (
                               <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl mb-6 flex items-start gap-3 border border-indigo-100 dark:border-indigo-800">
                                  <i className="fas fa-sparkles text-indigo-500 mt-1"></i>
                                  <div>
                                      <p className="text-xs text-indigo-500 font-bold uppercase mb-1">AI Assistant Note</p>
                                      <p className="text-indigo-900 dark:text-indigo-300 italic text-sm leading-relaxed">"{order.ai_note}"</p>
                                  </div>
                               </div>
                          )}

                          <div className="space-y-4">
                              {order.items?.map((item, idx) => (
                                  <div key={idx} className="flex items-center gap-4">
                                      <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600 flex-shrink-0">
                                          <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                                      </div>
                                      <div className="flex-1">
                                          <h4 className="font-bold text-slate-800 dark:text-white">{item.product_name}</h4>
                                          <p className="text-sm text-slate-500">Quantity: {item.quantity}</p>
                                          <p className="text-primary font-bold">${Number(item.price).toFixed(2)}</p>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
};

export default OrdersView;