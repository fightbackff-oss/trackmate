import React from 'react';
import { Map, Users, Bell, Settings } from 'lucide-react';
import { clsx } from 'clsx';

interface BottomNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  alertCount: number;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange, alertCount }) => {
  const tabs = [
    { id: 'map', icon: Map },
    { id: 'friends', icon: Users },
    { id: 'alerts', icon: Bell, badge: alertCount },
    { id: 'settings', icon: Settings },
  ];

  return (
    <div className="absolute bottom-6 left-0 w-full px-6 z-[2000] flex justify-center pb-safe">
      <div className="flex items-center justify-between w-full max-w-xs bg-white/80 dark:bg-[#0c1214]/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[32px] px-2 py-2 shadow-2xl shadow-black/10 dark:shadow-black/50 transition-colors duration-300">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative w-14 h-14 flex items-center justify-center rounded-full transition-all duration-300"
            >
              {isActive && (
                <div className="absolute inset-0 bg-[#a3e635] dark:bg-[#2f4b3a] rounded-full blur-md opacity-30 dark:opacity-50"></div>
              )}
              <div className={clsx(
                "relative z-10 flex items-center justify-center w-full h-full rounded-full transition-all duration-300",
                isActive ? "bg-[#a3e635] text-black shadow-[0_0_15px_rgba(163,230,53,0.4)]" : "text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
              )}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              {tab.badge ? (
                <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-[#0c1214]"></span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;