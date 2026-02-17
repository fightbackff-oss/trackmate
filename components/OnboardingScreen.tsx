import React, { useState } from 'react';
import { Shield, ArrowRight, MapPin, AlertTriangle, CheckCircle } from 'lucide-react';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestPermission = () => {
    setIsLoading(true);
    setError(null);
    if (!('geolocation' in navigator)) { setError("Geolocation is not supported by your device."); setIsLoading(false); return; }

    navigator.geolocation.getCurrentPosition(
      (position) => { setIsLoading(false); onComplete(); },
      (err) => {
        setIsLoading(false); console.error(err);
        if (err.code === 1) setError("Permission denied. You MUST allow location access.");
        else setError("Unable to retrieve location.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="h-[100dvh] w-full bg-[#f0f9ff] dark:bg-[#05080a] text-slate-900 dark:text-white flex flex-col relative overflow-hidden font-sans p-6 transition-colors duration-300">
      <div className="absolute top-0 right-0 w-full h-[60%] bg-gradient-to-b from-[#e0f7fa]/60 to-transparent dark:from-[#0f2e2e]/20 dark:to-transparent pointer-events-none transition-colors duration-500"></div>

      <div className="flex-1 flex flex-col items-center justify-center z-10">
        <div className="relative mb-12">
          <div className="w-48 h-48 bg-[#a3e635]/10 dark:bg-[#a3e635]/5 rounded-full flex items-center justify-center animate-pulse">
            <div className="w-32 h-32 bg-[#a3e635]/20 dark:bg-[#a3e635]/10 rounded-full flex items-center justify-center border border-[#a3e635]/20 shadow-[0_0_40px_rgba(163,230,53,0.1)]">
               <MapPin size={48} className="text-[#65a30d] dark:text-[#a3e635] drop-shadow-[0_0_15px_rgba(163,230,53,0.5)]" />
            </div>
          </div>
          <div className="absolute -bottom-4 -right-2 bg-white dark:bg-[#0c1214] p-3 rounded-[16px] border border-slate-200 dark:border-white/10 shadow-xl">
            <Shield size={24} className="text-[#65a30d] dark:text-[#a3e635]" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-center mb-4 leading-tight text-slate-900 dark:text-white">
          Location<br/>
          <span className="text-[#65a30d] dark:text-[#a3e635]">Required</span>
        </h1>
        
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-[24px] p-5 mb-10 w-full">
           <div className="flex items-start gap-4">
              <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-red-600 dark:text-red-200 leading-relaxed font-medium">
                To ensure your safety and real-time tracking, you must allow <strong>"Always On"</strong> location access.
              </p>
           </div>
        </div>

        <button 
          onClick={requestPermission}
          disabled={isLoading}
          className="w-full bg-[#a3e635] hover:bg-[#bef264] text-black font-bold py-4 rounded-[20px] flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-[#a3e635]/20 text-sm uppercase tracking-wider"
        >
          {isLoading ? (
              <span className="flex items-center gap-2">Checking... <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div></span>
          ) : (
              <>Grant Permission <ArrowRight className="ml-2" size={18} /></>
          )}
        </button>

        {error && <div className="mt-4 text-red-500 dark:text-red-400 text-xs font-bold bg-red-100 dark:bg-red-900/20 py-3 px-5 rounded-[12px] w-full text-center">{error}</div>}
      </div>
    </div>
  );
};

export default OnboardingScreen;