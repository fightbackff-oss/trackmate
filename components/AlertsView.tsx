import React from 'react';
import { Sliders, Check, Bell, Shield, Clock } from 'lucide-react';
import { Alert } from '../types';

interface AlertsViewProps {
  alerts: Alert[];
  onDismiss: (id: string) => void;
}

const AlertsView: React.FC<AlertsViewProps> = ({ alerts, onDismiss }) => {
  return (
    <div className="h-full bg-transparent text-slate-900 dark:text-white p-6 pt-8 overflow-y-auto pb-32 relative z-10 transition-colors duration-300">
       <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight">Alerts</h1>
          <div className="flex space-x-3 text-slate-400 dark:text-gray-400">
             <button className="w-10 h-10 glass-panel bg-white/50 dark:bg-transparent rounded-full flex items-center justify-center hover:text-slate-900 dark:hover:text-white hover:border-[#a3e635]/50 transition-colors"><Sliders size={18} /></button>
             <button className="w-10 h-10 glass-panel bg-white/50 dark:bg-transparent rounded-full flex items-center justify-center hover:text-slate-900 dark:hover:text-white hover:border-[#a3e635]/50 transition-colors"><Check size={18} /></button>
          </div>
       </div>
  
       {alerts.length === 0 ? (
         <div className="flex flex-col items-center justify-center h-[50vh] text-slate-500 dark:text-gray-500 glass-panel bg-white/50 dark:bg-transparent rounded-[32px]">
            <Bell size={48} className="mb-6 opacity-20" />
            <p className="text-sm tracking-wider font-medium">NO NEW ALERTS</p>
         </div>
       ) : (
         <>
          <h2 className="text-xs font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest mb-6 px-1">Recent Activity</h2>
          <div className="space-y-4">
              {alerts.map(alert => (
                <div key={alert.id} className={`rounded-[32px] p-6 border relative overflow-hidden group ${
                    alert.type === 'SOS' 
                    ? 'bg-red-50 dark:bg-red-950/40 border-red-500/30' 
                    : 'glass-card bg-white/50 dark:bg-transparent hover:bg-white/80 dark:hover:bg-white/5 border-slate-200 dark:border-white/5'
                }`}>
                    {/* SOS Pulse Effect */}
                    {alert.type === 'SOS' && <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 blur-3xl rounded-full -mr-10 -mt-10 animate-pulse"></div>}

                    <div className="flex items-start space-x-5 mb-4 relative z-10">
                      <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center flex-shrink-0 ${
                          alert.type === 'SOS' ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-slate-100 dark:bg-white/5 text-[#65a30d] dark:text-[#a3e635]'
                      }`}>
                          <Shield size={22} />
                      </div>
                      <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className={`font-bold text-sm tracking-wide uppercase ${
                                alert.type === 'SOS' ? 'text-red-500 dark:text-red-400' : 'text-[#65a30d] dark:text-[#a3e635]'
                            }`}>{alert.title}</h3>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-gray-300 leading-relaxed font-medium">{alert.message}</p>
                          <div className="flex items-center mt-3 text-xs text-slate-400 dark:text-gray-500 font-medium">
                             <Clock size={12} className="mr-1.5" />
                             {new Date(alert.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                      </div>
                    </div>
                    
                    <div className="flex border-t border-slate-200 dark:border-white/5 pt-4 mt-2 relative z-10">
                      <button className="flex-1 text-[10px] font-bold text-slate-700 dark:text-white bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 py-3 rounded-[14px] transition-colors tracking-widest uppercase">
                         Details
                      </button>
                      <button 
                        onClick={() => onDismiss(alert.id)}
                        className="flex-1 text-[10px] font-bold text-slate-500 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white py-3 ml-3 transition-colors tracking-widest uppercase"
                      >
                          Dismiss
                      </button>
                    </div>
                </div>
              ))}
          </div>
         </>
       )}
    </div>
  );
};

export default AlertsView;