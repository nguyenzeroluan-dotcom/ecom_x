
import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { ViewState } from '../types';
import { createOrder } from '../services/orderService';
import { addToLibrary } from '../services/libraryService';
import { DATABASE_SETUP_SQL } from '../services/databaseService';
import { GoogleGenAI } from "@google/genai";
import { GEMINI_CHAT_MODEL } from '../constants';
import { useAuth } from '../contexts/AuthContext';

interface CheckoutViewProps {
  setView: (view: ViewState) => void;
}

const CheckoutView: React.FC<CheckoutViewProps> = ({ setView }) => {
  const { items, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');
  const [error, setError] = useState<string | null>(null);
  const [setupRequired, setSetupRequired] = useState(false);
  const [aiNote, setAiNote] = useState<string>('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    zip: '',
    cardNumber: '',
    expiry: '',
    cvc: ''
  });

  // Auto-fill if user is logged in
  useEffect(() => {
      if (user) {
          const parts = (user.full_name || '').split(' ');
          setFormData(prev => ({
              ...prev,
              firstName: parts[0] || '',
              lastName: parts.slice(1).join(' ') || '',
              email: user.email,
              address: user.address || '',
              city: user.city || ''
          }));
      }
  }, [user]);

  const tax = cartTotal * 0.08;
  const total = cartTotal + tax;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateAINote = async (customerName: string, boughtItems: string[]) => {
    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) return "Thank you for your purchase!";
        
        const ai = new GoogleGenAI({ apiKey });
        
        const prompt = `Write a short, creative, and personalized thank you note (max 50 words) for a customer named ${customerName} who just bought: ${boughtItems.join(', ')}. Add a small "AI Care Tip" for one of the items.`;
        
        const response = await ai.models.generateContent({
          model: GEMINI_CHAT_MODEL,
          contents: prompt
        });
        return response.text || "Thank you for your purchase!";
    } catch (e) {
        return "Thank you for your purchase! Our AI is taking a nap, but we appreciate your business.";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');
    setError(null);
    setSetupRequired(false);

    try {
      // 1. Generate AI Note
      const boughtItemNames = items.map(i => i.name);
      const generatedNote = await generateAINote(formData.firstName, boughtItemNames);
      setAiNote(generatedNote);

      // 2. Save Order to Supabase
      await createOrder(
        { 
            name: `${formData.firstName} ${formData.lastName}`, 
            email: formData.email,
            user_id: user?.id // Link to user
        },
        items,
        total,
        generatedNote
      );

      // 3. Add Digital Items to Library
      if (user?.id) {
          for (const item of items) {
              if (item.is_digital) {
                  await addToLibrary(user.id, item.id);
              }
          }
      }

      // 4. Success
      clearCart();
      setStep('success');

    } catch (err: any) {
      console.error("Checkout Error", err);
      setStep('form');
      if (err.message?.includes("Table 'orders' does not exist") || err.message?.includes('does not exist')) {
          setSetupRequired(true);
          setError("System Update Required: Database tables are missing or incomplete.");
      } else {
          setError("Checkout failed: " + err.message);
      }
    }
  };

  if (items.length === 0 && step === 'form') {
      return (
          <div className="max-w-4xl mx-auto px-4 py-16 text-center">
              <div className="mb-6">
                  <i className="fas fa-shopping-basket text-6xl text-slate-200"></i>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Your cart is empty</h2>
              <p className="text-slate-500 mb-8">Looks like you haven't added anything yet.</p>
              <button 
                  onClick={() => setView(ViewState.HOME)}
                  className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-600 transition-all"
              >
                  Return to Market
              </button>
          </div>
      );
  }

  if (step === 'success') {
      return (
          <div className="max-w-2xl mx-auto px-4 py-16 text-center animate-fade-in">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-small">
                  <i className="fas fa-check text-5xl text-green-500"></i>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Order Confirmed!</h2>
              <p className="text-slate-500 mb-8">Thank you for shopping with NexusCommerce.</p>
              
              {aiNote && (
                  <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl mb-8 text-left relative overflow-hidden">
                      <div className="absolute top-0 right-0 opacity-10 p-4">
                          <i className="fas fa-robot text-6xl text-indigo-900"></i>
                      </div>
                      <h4 className="text-indigo-800 font-bold text-sm uppercase tracking-wider mb-2 flex items-center">
                          <i className="fas fa-sparkles mr-2"></i> Message from AI Assistant
                      </h4>
                      <p className="text-indigo-900 italic leading-relaxed">
                          "{aiNote}"
                      </p>
                  </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                      onClick={() => setView(ViewState.LIBRARY)}
                      className="bg-purple-100 text-purple-700 px-6 py-3 rounded-xl font-bold hover:bg-purple-200 transition-all flex items-center justify-center gap-2"
                  >
                      <i className="fas fa-book-reader"></i> Open Library
                  </button>
                  <button 
                      onClick={() => setView(ViewState.ORDERS)}
                      className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all"
                  >
                      View Orders
                  </button>
                  <button 
                      onClick={() => setView(ViewState.HOME)}
                      className="bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-600 transition-all"
                  >
                      Continue Shopping
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-8 flex items-center">
          <span className="bg-slate-100 p-2 rounded-lg mr-3 text-xl"><i className="fas fa-lock text-slate-500"></i></span>
          Secure Checkout
      </h1>

      {setupRequired && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-xl shadow-sm animate-fade-in">
          <div className="w-full">
              <h3 className="text-lg font-bold text-red-800 mb-1">Database Setup Required</h3>
              <p className="text-sm text-red-700 mb-3">The 'orders' table is missing or incomplete. Please run this SQL in Supabase:</p>
              <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto shadow-inner border border-slate-700 mt-2">
                  <button onClick={() => navigator.clipboard.writeText(DATABASE_SETUP_SQL)} className="text-xs bg-slate-700 text-white px-2 py-1 rounded mb-2 block w-max hover:bg-slate-600 transition-colors">Copy Full SQL</button>
                  <pre className="text-green-400 text-xs font-mono whitespace-pre-wrap">
{DATABASE_SETUP_SQL}
                  </pre>
              </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Form */}
          <div className="lg:col-span-2 space-y-6">
              <form id="checkout-form" onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
                  
                  {/* Contact */}
                  <div>
                      <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Contact Info</h3>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                              <input required name="firstName" value={formData.firstName} onChange={handleInputChange} type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none" />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                              <input required name="lastName" value={formData.lastName} onChange={handleInputChange} type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none" />
                          </div>
                          <div className="col-span-2">
                              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                              <input required name="email" value={formData.email} onChange={handleInputChange} type="email" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none" />
                          </div>
                      </div>
                  </div>

                  {/* Shipping */}
                  <div>
                      <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Shipping Address</h3>
                      <div className="space-y-4">
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                              <input required name="address" value={formData.address} onChange={handleInputChange} type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                                  <input required name="city" value={formData.city} onChange={handleInputChange} type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none" />
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-1">ZIP Code</label>
                                  <input required name="zip" value={formData.zip} onChange={handleInputChange} type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none" />
                              </div>
                          </div>
                      </div>
                  </div>

                   {/* Payment (Mock) */}
                   <div>
                      <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Payment Details</h3>
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4 flex items-center text-sm text-slate-500">
                          <i className="fas fa-info-circle mr-2"></i> This is a demo. No real payment will be processed.
                      </div>
                      <div className="space-y-4">
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Card Number</label>
                              <input required name="cardNumber" value={formData.cardNumber} onChange={handleInputChange} placeholder="0000 0000 0000 0000" type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-1">Expiry</label>
                                  <input required name="expiry" value={formData.expiry} onChange={handleInputChange} placeholder="MM/YY" type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none" />
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-1">CVC</label>
                                  <input required name="cvc" value={formData.cvc} onChange={handleInputChange} placeholder="123" type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none" />
                              </div>
                          </div>
                      </div>
                  </div>

                  {error && <div className="text-red-500 text-sm font-medium">{error}</div>}

                  <div className="pt-4">
                      <button 
                          type="submit" 
                          disabled={step === 'processing'}
                          className="w-full bg-primary hover:bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg transition-all disabled:opacity-50 flex justify-center items-center"
                      >
                          {step === 'processing' ? (
                              <><i className="fas fa-circle-notch fa-spin mr-2"></i> Processing Order...</>
                          ) : (
                              `Pay $${total.toFixed(2)}`
                          )}
                      </button>
                  </div>

              </form>
          </div>

          {/* Right: Summary */}
          <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Order Summary</h3>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {items.map(item => (
                          <div key={item.id} className="flex gap-3">
                              <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden border border-slate-100 flex-shrink-0">
                                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1">
                                  <h4 className="text-sm font-medium text-slate-900 line-clamp-2">{item.name}</h4>
                                  <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                                  {item.is_digital && <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-md font-bold">E-Book</span>}
                                  <p className="text-sm font-bold text-slate-700">${(Number(item.price) * item.quantity).toFixed(2)}</p>
                              </div>
                          </div>
                      ))}
                  </div>
                  
                  <div className="border-t border-slate-100 mt-4 pt-4 space-y-2">
                      <div className="flex justify-between text-slate-500 text-sm">
                          <span>Subtotal</span>
                          <span>${cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-500 text-sm">
                          <span>Tax (8%)</span>
                          <span>${tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-900 font-bold text-lg pt-2">
                          <span>Total</span>
                          <span>${total.toFixed(2)}</span>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default CheckoutView;
