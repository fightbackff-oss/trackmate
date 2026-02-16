import React from 'react';
import { User as UserIcon, Edit2, LogOut, MapPin, ChevronRight, EyeOff, Shield, Activity, Moon, Sun } from 'lucide-react';
import { User } from '../types';

interface SettingsViewProps {
  isSharing: boolean;
  onToggleSharing: (val: boolean) => void;
  onLogout: () => void;
  currentUser: User | null;
  onUpdateProfile: (updates: Partial<User>) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ 
  isSharing, 
  onToggleSharing, 
  onLogout, 
  currentUser,
  onUpdateProfile,
  theme,
  onToggleTheme
}) => {
  
  const handleDeleteAccount = () => {
    if(confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      alert("Account deletion scheduled.");
    }
  };

  return (
    <div className="h-full bg-transparent text-slate-900 dark:text-white p-6 pt-8 overflow-y-auto pb-32 relative z-10 transition-colors duration-300">
       <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <div className="w-12 h-12 rounded-full p-0.5 glass-panel bg-white/50 dark:bg-transparent">
             {currentUser && <img src={currentUser.avatar} className="w-full h-full object-cover rounded-full" />}
          </div>
       </div>
  
       {/* Account Section */}
       <div className="mb-8">
          <h2 className="text-xs font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest mb-4 px-1">Account</h2>
          <div className="glass-card rounded-[32px] overflow-hidden bg-white/50 dark:bg-transparent">
             <div className="w-full p-6 flex items-center justify-between border-b border-slate-200 dark:border-white/5">
                <div className="flex items-center space-x-4">
                   <button 
                     onClick={() => {
                       const url = prompt("Enter profile image URL:");
                       if (url !== null) onUpdateProfile({ avatar: url });
                     }}
                     className="relative group w-14 h-14"
                   >
                     <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-slate-200 dark:border-white/10">
                        <img src={currentUser?.avatar} className="w-full h-full object-cover" />
                     </div>
                     <div className="absolute inset-0 bg-black/60 hidden group-hover:flex items-center justify-center rounded-full">
                       <Edit2 size={16} className="text-white" />
                     </div>
                   </button>
                   <div className="text-left">
                      <span className="block text-lg font-bold text-slate-900 dark:text-white">{currentUser?.name || 'User'}</span>
                      <span className="block text-xs text-slate-500 dark:text-gray-400 mt-1 uppercase tracking-wide">{currentUser?.email}</span>
                   </div>
                </div>
                <button onClick={() => {
                   const name = prompt("Enter new name:", currentUser?.name);
                   if (name) onUpdateProfile({ name });
                }} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:bg-[#a3e635] hover:text-black transition-colors">
                  <Edit2 size={16} />
                </button>
             </div>
             <button onClick={onLogout} className="w-full p-5 flex items-center space-x-4 text-red-500 dark:text-red-400 hover:bg-red-500/10 transition-colors">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                    <LogOut size={18} />
                </div>
                <span className="text-sm font-bold uppercase tracking-wider">Sign Out</span>
             </button>
          </div>
       </div>

       {/* Appearance Section */}
       <div className="mb-8">
          <h2 className="text-xs font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest mb-4 px-1">Appearance</h2>
          <div className="glass-card rounded-[32px] overflow-hidden bg-white/50 dark:bg-transparent">
             <div className="w-full p-5 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                   <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500 dark:text-indigo-400">
                        {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                   </div>
                   <span className="text-sm font-bold uppercase tracking-wide text-slate-800 dark:text-white">Dark Mode</span>
                </div>
                <button onClick={onToggleTheme} className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${theme === 'dark' ? 'bg-[#a3e635]' : 'bg-slate-300 dark:bg-gray-700'}`}>
                   <div className={`w-6 h-6 bg-white dark:bg-black rounded-full shadow-lg transition-transform duration-300 ${theme === 'dark' ? 'translate-x-6' : ''}`}></div>
                </button>
             </div>
          </div>
       </div>
  
       {/* Privacy Section */}
       <div className="mb-8">
          <h2 className="text-xs font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest mb-4 px-1">Privacy & Data</h2>
          <div className="glass-card rounded-[32px] overflow-hidden bg-white/50 dark:bg-transparent">
             <div className="w-full p-5 flex items-center justify-between border-b border-slate-200 dark:border-white/5">
                <div className="flex items-center space-x-4">
                   <div className="w-10 h-10 rounded-full bg-[#a3e635]/10 flex items-center justify-center text-[#65a30d] dark:text-[#a3e635]">
                        <MapPin size={18} />
                   </div>
                   <span className="text-sm font-bold uppercase tracking-wide text-slate-800 dark:text-white">Location Sharing</span>
                </div>
                <button onClick={() => onToggleSharing(!isSharing)} className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${isSharing ? 'bg-[#a3e635]' : 'bg-slate-300 dark:bg-gray-700'}`}>
                   <div className={`w-6 h-6 bg-white dark:bg-black rounded-full shadow-lg transition-transform duration-300 ${isSharing ? 'translate-x-6' : ''}`}></div>
                </button>
             </div>
             <div className="w-full p-5 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                   <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center text-slate-400 dark:text-gray-400">
                        <EyeOff size={18} />
                   </div>
                   <div className="flex flex-col">
                       <span className="text-sm font-bold uppercase tracking-wide text-slate-400 dark:text-gray-400">Ghost Mode</span>
                       <span className="text-[10px] text-slate-400 dark:text-gray-600">Premium Feature</span>
                   </div>
                </div>
                <button className={`w-14 h-8 rounded-full p-1 bg-slate-200 dark:bg-gray-800/50 cursor-not-allowed opacity-50 border border-slate-200 dark:border-white/5`}>
                   <div className={`w-6 h-6 bg-slate-400 dark:bg-gray-600 rounded-full shadow`}></div>
                </button>
             </div>
          </div>
       </div>

       {/* Security */}
       <div className="mb-6">
          <h2 className="text-xs font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest mb-4 px-1">Danger Zone</h2>
          <div className="glass-card rounded-[32px] overflow-hidden border border-red-500/20 bg-white/50 dark:bg-transparent">
             <button onClick={handleDeleteAccount} className="w-full p-5 flex items-center justify-between hover:bg-red-500/10 transition-colors group">
                <div className="flex items-center space-x-4">
                   <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                        <Shield size={18} />
                   </div>
                   <span className="text-sm font-bold uppercase tracking-wide text-slate-600 dark:text-gray-300 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors">Delete Account</span>
                </div>
                <ChevronRight size={18} className="text-slate-400 dark:text-gray-600 group-hover:text-red-400" />
             </button>
          </div>
       </div>
    </div>
  );
};

export default SettingsView;