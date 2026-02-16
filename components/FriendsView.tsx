import React, { useState } from 'react';
import { Menu, Search, UserPlus, X, Send, Battery, Navigation, Sliders } from 'lucide-react';
import { User, UserStatus } from '../types';

interface FriendsViewProps {
  friends: User[];
  onAddFriend: (email: string) => void;
  currentUser: User | null;
  onLocateFriend: (friend: User) => void;
  onOpenMenu: () => void;
}

const FriendsView: React.FC<FriendsViewProps> = ({ 
  friends, 
  onAddFriend, 
  currentUser,
  onLocateFriend,
  onOpenMenu
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFriendEmail, setNewFriendEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSendRequest = async () => {
    if(!newFriendEmail || !currentUser) return;
    setLoading(true);
    await onAddFriend(newFriendEmail);
    setLoading(false);
    setNewFriendEmail('');
    setShowAddModal(false);
  };

  const filteredFriends = friends.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full bg-transparent text-slate-900 dark:text-white p-6 pt-8 overflow-y-auto pb-32 relative z-10 transition-colors duration-300">
       {/* Header */}
       <div className="mb-8">
         <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Friends</h1>
            <div className="flex gap-3">
                <button 
                  onClick={onOpenMenu} 
                  className="w-10 h-10 glass-panel bg-white/50 dark:bg-transparent rounded-full flex items-center justify-center text-slate-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
                >
                   <Menu size={20} />
                </button>
                <div className="w-10 h-10 rounded-full overflow-hidden glass-panel p-0.5 bg-white/50 dark:bg-transparent">
                   {currentUser && <img src={currentUser.avatar} className="w-full h-full object-cover rounded-full" />}
                </div>
            </div>
         </div>

         <div className="relative mb-6">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 dark:text-gray-500">
               <Search size={18} />
            </div>
            <input 
               type="text" 
               placeholder="Search friends..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full h-12 glass-panel bg-white/50 dark:bg-transparent rounded-[20px] pl-12 pr-4 focus:outline-none focus:border-[#a3e635] text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 transition-colors"
            />
         </div>

         <div className="flex justify-between items-center">
            <p className="text-slate-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider">{filteredFriends.length} CONNECTED</p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-[#a3e635] p-3 rounded-xl text-black hover:scale-105 transition-transform shadow-lg shadow-[#a3e635]/20"
            >
              <UserPlus size={20} />
            </button>
         </div>
       </div>

       {/* Add Friend Modal */}
       {showAddModal && (
         <div className="mb-8 glass-card rounded-[24px] p-5 animate-in fade-in slide-in-from-top-4 border border-[#a3e635]/20 bg-white/80 dark:bg-[#0c1214]/80">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-sm text-[#65a30d] dark:text-[#a3e635]">ADD NEW FRIEND</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"><X size={16}/></button>
            </div>
            <div className="flex gap-2">
              <input 
                type="email" 
                value={newFriendEmail}
                onChange={(e) => setNewFriendEmail(e.target.value)}
                placeholder="Enter email address"
                className="flex-1 bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#a3e635] text-slate-900 dark:text-white placeholder-slate-400"
              />
              <button 
                onClick={handleSendRequest}
                disabled={loading}
                className="bg-[#a3e635] px-5 rounded-xl flex items-center justify-center text-black font-bold hover:bg-[#bef264] disabled:opacity-50"
              >
                {loading ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div> : <Send size={18} />}
              </button>
            </div>
         </div>
       )}

       {/* List */}
       <div className="space-y-4">
         {filteredFriends.length === 0 ? (
            <div className="text-center text-slate-500 dark:text-gray-500 py-20 glass-panel bg-white/50 dark:bg-transparent rounded-[32px]">
               <p className="text-sm">{searchTerm ? 'No matching friends found.' : 'No friends yet.'}</p>
            </div>
         ) : filteredFriends.map(friend => (
           <div key={friend.id} className="glass-card bg-white/50 dark:bg-transparent rounded-[32px] p-5 hover:bg-white/80 dark:hover:bg-white/5 transition-colors group">
              <div className="flex justify-between items-start mb-4">
                 <div className="flex items-center space-x-4">
                    <div className="relative">
                       <img src={friend.avatar} className="w-14 h-14 rounded-full border-2 border-slate-100 dark:border-white/10 object-cover" />
                       {friend.status === UserStatus.ONLINE && (
                         <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#a3e635] border-2 border-white dark:border-[#132026] rounded-full shadow-[0_0_10px_#a3e635]"></div>
                       )}
                    </div>
                    <div>
                       <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-[#65a30d] dark:group-hover:text-[#a3e635] transition-colors">{friend.name}</h3>
                       <p className="text-xs text-slate-500 dark:text-gray-400 flex items-center mt-1 font-medium tracking-wide">
                          {friend.status === UserStatus.MOVING ? 'MOVING' : 'ONLINE'} 
                          <span className="mx-2 opacity-50">|</span> 
                          <span className={friend.batteryLevel < 20 ? "text-red-500 dark:text-red-400" : "text-[#65a30d] dark:text-[#a3e635]"}>{friend.batteryLevel}% BATT</span>
                       </p>
                    </div>
                 </div>
                 <div className="w-8 h-8 rounded-full glass-panel bg-slate-100 dark:bg-transparent flex items-center justify-center text-slate-400 dark:text-gray-400">
                    <Battery size={14} className={friend.batteryLevel < 20 ? "text-red-500 dark:text-red-400" : "text-[#65a30d] dark:text-[#a3e635]"} />
                 </div>
              </div>
              <div className="flex gap-3">
                <button 
                    onClick={() => onLocateFriend(friend)}
                    className="flex-1 bg-slate-100 dark:bg-white/5 hover:bg-[#a3e635] hover:text-black text-slate-700 dark:text-white py-3 rounded-[20px] text-xs font-bold uppercase tracking-wider flex items-center justify-center transition-all border border-slate-200 dark:border-white/5"
                >
                  <Navigation size={14} className="mr-2" /> Track Live
                </button>
              </div>
           </div>
         ))}
       </div>
    </div>
  );
};

export default FriendsView;