import React from 'react';
import { X, Shield, FileText, HelpCircle, LogOut, Github } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  currentUser: any;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onLogout, currentUser }) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-900/50 dark:bg-[#05080a]/80 backdrop-blur-sm z-[3000] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div className={`fixed top-0 left-0 h-full w-[300px] bg-white/90 dark:bg-[#0c1214]/90 backdrop-blur-2xl border-r border-slate-200 dark:border-white/5 z-[3001] transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col shadow-2xl shadow-black/10 dark:shadow-black`}>
        <div className="p-8 border-b border-slate-200 dark:border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full p-0.5 border border-[#a3e635]/30">
                   {currentUser && <img src={currentUser.avatar} className="w-full h-full object-cover rounded-full" />}
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">{currentUser?.name || 'User'}</h3>
                    <p className="text-xs text-[#65a30d] dark:text-[#a3e635] tracking-wider uppercase font-medium">Free Plan</p>
                </div>
            </div>
            <button onClick={onClose} className="text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors">
                <X size={20} />
            </button>
        </div>

        <div className="p-6">
            <nav className="space-y-2">
                <button className="flex items-center gap-4 w-full px-4 py-4 text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white rounded-[20px] transition-all text-sm font-bold uppercase tracking-wide group">
                    <Shield size={18} className="text-slate-400 dark:text-gray-500 group-hover:text-[#65a30d] dark:group-hover:text-[#a3e635] transition-colors" /> Privacy Center
                </button>
                <button className="flex items-center gap-4 w-full px-4 py-4 text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white rounded-[20px] transition-all text-sm font-bold uppercase tracking-wide group">
                    <FileText size={18} className="text-slate-400 dark:text-gray-500 group-hover:text-[#65a30d] dark:group-hover:text-[#a3e635] transition-colors" /> Terms of Service
                </button>
                <button className="flex items-center gap-4 w-full px-4 py-4 text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white rounded-[20px] transition-all text-sm font-bold uppercase tracking-wide group">
                    <HelpCircle size={18} className="text-slate-400 dark:text-gray-500 group-hover:text-[#65a30d] dark:group-hover:text-[#a3e635] transition-colors" /> Help & Support
                </button>
            </nav>
        </div>

        <div className="mt-auto p-8 border-t border-slate-200 dark:border-white/5">
             <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-gray-600 uppercase tracking-widest mb-6 px-2">
                <span>TrackMate Inc.</span>
                <span>v1.0.0</span>
            </div>
            <button onClick={onLogout} className="flex items-center justify-center gap-3 w-full bg-slate-100 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 py-4 rounded-[20px] transition-colors text-xs font-bold uppercase tracking-widest">
                <LogOut size={16} /> Sign Out
            </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;