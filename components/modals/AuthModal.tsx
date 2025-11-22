
import React, { useState } from 'react';
import BaseModal from './BaseModal';
import { useModal } from '../../contexts/ModalContext';
import { useAuth } from '../../contexts/AuthContext';

const AuthModal: React.FC = () => {
  const { isOpen, closeModal } = useModal();
  const { signIn, demoLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    await signIn(email);
    setIsLoading(false);
    // Don't close modal immediately, let user see "Check email" notification
  };

  const handleDemo = () => {
      demoLogin();
      closeModal();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={closeModal} size="sm" title={mode === 'login' ? 'Welcome Back' : 'Create Account'}>
      <div className="p-2">
         <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30 transform -rotate-6">
                <i className="fas fa-fingerprint text-3xl text-white"></i>
            </div>
            <p className="text-slate-500 text-sm">
                {mode === 'login' ? 'Sign in to access your personalized AI dashboard' : 'Join NexusCommerce for smart shopping'}
            </p>
         </div>

         <form onSubmit={handleSubmit} className="space-y-4">
             <div>
                 <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                 <div className="relative">
                    <i className="fas fa-envelope absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                        required
                    />
                 </div>
             </div>

             <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-primary hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-70 flex justify-center items-center"
             >
                 {isLoading ? <i className="fas fa-spinner fa-spin"></i> : (mode === 'login' ? 'Send Magic Link' : 'Sign Up')}
             </button>
         </form>

         <div className="relative my-6">
             <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
             <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-slate-500">Or continue with</span></div>
         </div>

         <button 
            onClick={handleDemo}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mb-4"
         >
             <i className="fas fa-user-secret"></i> Demo User (Instant)
         </button>

         <div className="text-center text-xs text-slate-400">
             {mode === 'login' ? (
                 <p>New here? <button onClick={() => setMode('signup')} className="text-primary font-bold hover:underline">Create an account</button></p>
             ) : (
                 <p>Already have an account? <button onClick={() => setMode('login')} className="text-primary font-bold hover:underline">Sign in</button></p>
             )}
         </div>
      </div>
    </BaseModal>
  );
};

export default AuthModal;
