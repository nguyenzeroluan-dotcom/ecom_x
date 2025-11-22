import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../services/geminiService';
import { ChatMessage } from '../types';
import { getProducts } from '../services/productService';

// Simple declaration for Web Speech API
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hello! I am your Nexus assistant. I know everything about our inventory. How can I help you shop today?', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [systemInstruction, setSystemInstruction] = useState<string>('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const loadContext = async () => {
      try {
        const products = await getProducts();
        const productList = products.map(p => 
          `- ${p.name} ($${p.price}): ${p.description} [Category: ${p.category}]`
        ).join('\n');
        
        const instruction = `You are a helpful shopping assistant for NexusCommerce. 
        Here is the current live inventory available in the store:
        ${productList}
        
        Rules:
        1. Only recommend products from this list.
        2. Be friendly, concise, and eager to help.
        3. If asked about products not on the list, strictly state we don't carry them.
        4. Mention prices when relevant.
        5. Act like a professional shop assistant.
        `;
        setSystemInstruction(instruction);
      } catch (e) {
        console.error("Failed to load product context for AI", e);
      }
    };
    loadContext();
  }, []);

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser doesn't support voice input.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    recognition.start();

    recognition.onresult = (event: any) => {
      const speechResult = event.results[0][0].transcript;
      setInput(speechResult);
      setIsListening(false);
    };

    recognition.onspeechend = () => {
      recognition.stop();
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };
  };

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: textToSend, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const responseText = await sendChatMessage(history, userMsg.text, systemInstruction);
      
      setMessages(prev => [...prev, {
        role: 'model',
        text: responseText || "I'm sorry, I didn't catch that.",
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        role: 'model',
        text: "I encountered an error connecting to the server. Please try again.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 p-4 flex items-center justify-between">
        <div className="flex items-center text-white">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
          <span className="font-semibold">Gemini Shopping Assistant</span>
        </div>
        <i className="fas fa-robot text-slate-400"></i>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
              msg.role === 'user' 
                ? 'bg-primary text-white rounded-br-none' 
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-bl-none'
            }`}>
              <p className="leading-relaxed text-sm whitespace-pre-wrap">{msg.text}</p>
              <span className={`text-[10px] block mt-2 opacity-70 ${msg.role === 'user' ? 'text-indigo-100' : 'text-slate-400'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-bl-none border border-slate-100 dark:border-slate-700 shadow-sm flex items-center space-x-2">
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <button
            onClick={handleVoiceInput}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              isListening 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200'
            }`}
            title="Voice Input"
          >
             <i className={`fas ${isListening ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about products..."
            className="flex-1 border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-slate-700 placeholder-slate-400"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="bg-primary hover:bg-indigo-600 disabled:opacity-50 text-white w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg shadow-indigo-500/20"
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;