import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MapPin, Sparkles, Navigation } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface AIChatOverlayProps {
  userLocation: { lat: number; lng: number } | null;
  onClose: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  groundingLinks?: { uri: string; title: string }[];
}

const AIChatOverlay: React.FC<AIChatOverlayProps> = ({ userLocation, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hi! I'm your Location Assistant. I can help you find places nearby using Google Maps data. Try asking 'Where is the nearest coffee shop?'"
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const config: any = {
        tools: [{googleMaps: {}}],
      };

      // Add retrieval config if location is available
      if (userLocation) {
        config.toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: userLocation.lat,
              longitude: userLocation.lng
            }
          }
        };
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: userMsg.text,
        config: config
      });

      const text = response.text || "I found some info but couldn't process the text.";
      
      // Extract grounding chunks for Maps
      const groundingLinks: { uri: string; title: string }[] = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      
      if (chunks) {
        chunks.forEach((chunk: any) => {
          if (chunk.maps?.uri) {
            groundingLinks.push({
              uri: chunk.maps.uri,
              title: chunk.maps.title || 'View on Maps'
            });
          }
        });
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: text,
        groundingLinks: groundingLinks.length > 0 ? groundingLinks : undefined
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: 'model',
        text: "Sorry, I encountered an error checking the map. Please try again."
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute inset-x-4 bottom-24 top-24 md:left-auto md:right-24 md:w-[400px] md:bottom-24 glass-panel bg-white/90 dark:bg-[#0c1214]/95 backdrop-blur-xl rounded-[32px] shadow-2xl z-[2000] flex flex-col overflow-hidden border border-[#a3e635]/20 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Header */}
      <div className="p-5 border-b border-slate-200 dark:border-white/5 flex justify-between items-center bg-white/50 dark:bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#a3e635]/20 flex items-center justify-center text-[#65a30d] dark:text-[#a3e635]">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Assistant</h3>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-gray-400 font-bold">Powered by Gemini Maps</p>
          </div>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-slate-500 dark:text-gray-400 transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div 
              className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-[#a3e635] text-black rounded-tr-sm font-medium' 
                  : 'bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-gray-200 rounded-tl-sm'
              }`}
            >
              {msg.text}
            </div>
            
            {/* Grounding Links (Maps Sources) */}
            {msg.groundingLinks && (
              <div className="mt-2 flex flex-wrap gap-2 max-w-[90%]">
                {msg.groundingLinks.map((link, idx) => (
                  <a 
                    key={idx}
                    href={link.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 text-xs font-bold rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors border border-blue-200 dark:border-blue-800/30"
                  >
                    <MapPin size={12} />
                    {link.title}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400 dark:text-gray-500 text-xs font-medium ml-2">
            <div className="w-2 h-2 bg-[#a3e635] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-[#a3e635] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-[#a3e635] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white/50 dark:bg-black/20 border-t border-slate-200 dark:border-white/5">
        <div className="flex items-center gap-2 bg-white dark:bg-[#0c1214] border border-slate-200 dark:border-white/10 rounded-[20px] px-2 py-2 shadow-sm focus-within:border-[#a3e635] transition-colors">
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about nearby places..."
            className="flex-1 bg-transparent px-3 py-1 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          <button 
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            className="w-10 h-10 rounded-[14px] bg-[#a3e635] text-black flex items-center justify-center hover:bg-[#bef264] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatOverlay;