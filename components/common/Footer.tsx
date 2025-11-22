
import React from 'react';
import { ViewState } from '../../types';

interface FooterProps {
  setView: (view: ViewState) => void;
}

const Footer: React.FC<FooterProps> = ({ setView }) => {
  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center cursor-pointer mb-4" onClick={() => setView(ViewState.HOME)}>
                <div className="bg-primary text-white p-2 rounded-lg mr-3 shadow-lg shadow-indigo-500/20">
                <i className="fas fa-cube text-xl"></i>
                </div>
                <span className="font-bold text-xl text-slate-800 tracking-tight font-display">NexusCommerce</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              The next generation of e-commerce powered by Gemini AI. Experience smart shopping like never before.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><button onClick={() => setView(ViewState.HOME)} className="hover:text-primary transition-colors">Marketplace</button></li>
              <li><button onClick={() => setView(ViewState.GENERATE)} className="hover:text-primary transition-colors">AI Studio</button></li>
              <li><button onClick={() => setView(ViewState.ANALYZE)} className="hover:text-primary transition-colors">Visual Search</button></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><button onClick={() => setView(ViewState.CHAT)} className="hover:text-primary transition-colors">AI Assistant</button></li>
              <li><button onClick={() => setView(ViewState.ORDERS)} className="hover:text-primary transition-colors">Order Status</button></li>
              <li><a href="#" className="hover:text-primary transition-colors">Shipping Info</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Stay Connected</h4>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-primary hover:text-white transition-all">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-primary hover:text-white transition-all">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-primary hover:text-white transition-all">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-400">
          <p>&copy; {new Date().getFullYear()} NexusCommerce. All rights reserved.</p>
          <p className="flex items-center mt-2 md:mt-0">
            Powered by <i className="fas fa-bolt text-yellow-400 mx-2"></i> Gemini 3 Pro
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
