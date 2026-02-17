import React, { useState, useEffect, useCallback } from 'react';
import { 
  Menu, Search, Layers, Locate, Plus, Minus, AlertTriangle
} from 'lucide-react';
import L from 'leaflet';
import MapView from './components/MapView';
import AuthScreen from './components/AuthScreen';
import OnboardingScreen from './components/OnboardingScreen';
import BottomNav from './components/BottomNav';
import FriendsView from './components/FriendsView';
import AlertsView from './components/AlertsView';
import SettingsView from './components/SettingsView';
import Sidebar from './components/Sidebar';
import { User, Alert, UserStatus, FriendRequest } from './types';
import { supabase } from './supabaseClient';

// --- HELPERS ---

const DEFAULT_AVATAR = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjOTRhM2I4IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTIwIDIxdi0yYTQgNCAwIDAgMC00LTRIOGE0IDQgMCAwIDAtNCA0djIiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjciIHI9IjQiLz48L3N2Zz4=";

const mapDbUserToAppUser = (dbUser: any): User => {
  const liveLoc = dbUser.live_locations?.[0] || dbUser.live_locations;
  
  // Validate coordinates to prevent (undefined, undefined) errors in Leaflet
  const hasValidCoords = liveLoc && 
                         typeof liveLoc.latitude === 'number' && 
                         typeof liveLoc.longitude === 'number';

  return {
    id: dbUser.id,
    username: dbUser.username || dbUser.email?.split('@')[0] || 'unknown',
    name: dbUser.name || dbUser.email?.split('@')[0] || 'Unknown',
    email: dbUser.email,
    avatar: dbUser.profile_image || DEFAULT_AVATAR,
    isSharing: dbUser.is_tracking_enabled ?? true,
    lastSeen: liveLoc?.updated_at || dbUser.last_seen || new Date().toISOString(),
    status: liveLoc?.is_online ? UserStatus.ONLINE : UserStatus.OFFLINE,
    batteryLevel: liveLoc?.battery_level || 50,
    location: hasValidCoords ? {
      lat: liveLoc.latitude,
      lng: liveLoc.longitude,
      timestamp: new Date(liveLoc.updated_at).getTime(),
      accuracy: liveLoc.accuracy
    } : undefined
  };
};

// --- SUB-COMPONENTS ---

const TopSearchBar = ({ 
  currentUser, 
  onMenuClick, 
  searchTerm, 
  setSearchTerm 
}: { 
  currentUser: User | null, 
  onMenuClick: () => void,
  searchTerm: string,
  setSearchTerm: (val: string) => void
}) => (
  <div className="absolute top-6 left-6 right-6 z-[1000] flex gap-4 pointer-events-none">
     <div className="flex-1 h-14 glass-panel rounded-[24px] flex items-center px-5 shadow-xl shadow-black/5 dark:shadow-black/20 pointer-events-auto bg-white/50 dark:bg-transparent">
        <button onClick={onMenuClick} className="text-slate-500 dark:text-gray-400 mr-4 hover:text-[#a3e635] transition-colors"><Menu size={22}/></button>
        <div className="text-slate-400 dark:text-gray-500 mr-3"><Search size={20}/></div>
        <input 
          type="text" 
          placeholder="Search friends..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent text-slate-800 dark:text-white text-base font-medium flex-1 focus:outline-none placeholder-slate-400 dark:placeholder-gray-500"
        />
     </div>
     <div className="h-14 w-14 rounded-[24px] glass-panel p-1 flex items-center justify-center shadow-xl shadow-black/5 dark:shadow-black/20 pointer-events-auto bg-white/50 dark:bg-transparent">
        <div className="w-full h-full rounded-[20px] overflow-hidden">
            {currentUser && <img src={currentUser.avatar} alt="Me" className="w-full h-full object-cover" />}
        </div>
     </div>
  </div>
);

const FloatingMapControls = ({ 
  onRecenter, 
  onZoomIn, 
  onZoomOut, 
  onToggleLayers,
  mapType
}: { 
  onRecenter: () => void,
  onZoomIn: () => void,
  onZoomOut: () => void,
  onToggleLayers: () => void,
  mapType: 'street' | 'satellite'
}) => (
  <div className="absolute bottom-32 right-6 z-[1000] flex flex-col space-y-4 pointer-events-none">
    <button onClick={onToggleLayers} className="w-12 h-12 glass-panel rounded-[20px] text-slate-600 dark:text-gray-300 flex items-center justify-center shadow-lg hover:text-[#a3e635] pointer-events-auto active:scale-95 transition-transform bg-white/80 dark:bg-transparent">
      <Layers size={22} className={mapType === 'satellite' ? 'text-[#a3e635]' : ''} />
    </button>
    <button onClick={onRecenter} className="w-12 h-12 bg-[#a3e635] text-black rounded-[20px] flex items-center justify-center shadow-lg shadow-[#a3e635]/20 active:scale-95 transition-transform pointer-events-auto">
      <Locate size={22} />
    </button>
    <div className="flex flex-col glass-panel rounded-[20px] shadow-lg overflow-hidden pointer-events-auto bg-white/80 dark:bg-transparent">
      <button onClick={onZoomIn} className="w-12 h-12 text-slate-600 dark:text-gray-300 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 border-b border-black/5 dark:border-white/5 active:bg-black/10 dark:active:bg-white/10">
         <Plus size={22} />
      </button>
      <button onClick={onZoomOut} className="w-12 h-12 text-slate-600 dark:text-gray-300 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 active:bg-black/10 dark:active:bg-white/10">
         <Minus size={22} />
      </button>
    </div>
  </div>
);

const LocationBlockerScreen = ({ onRetry }: { onRetry: () => void }) => (
    <div className="absolute inset-0 z-[9999] bg-[#f0f9ff] dark:bg-[#05080a] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-8 animate-pulse border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <AlertTriangle size={48} className="text-red-500" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Location Required</h2>
        <p className="text-slate-500 dark:text-gray-400 mb-10 max-w-xs leading-relaxed">
            Arctic Aurora requires location access to function. Please enable "Always Allow" in settings.
        </p>
        <button 
            onClick={onRetry}
            className="bg-[#a3e635] text-black font-bold py-4 px-10 rounded-[20px] shadow-lg shadow-[#a3e635]/20 hover:scale-105 transition-transform"
        >
            Try Again
        </button>
    </div>
);

// --- MAIN APP COMPONENT ---

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [activeTab, setActiveTab] = useState('map');
  const [locationDenied, setLocationDenied] = useState(false);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mapType, setMapType] = useState<'street' | 'satellite'>('street');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
        return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
    }
    return 'dark';
  });

  // App State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [friends, setFriends] = useState<User[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  // Apply Theme
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Filtered friends for Map Search
  const filteredFriendIds = searchTerm 
    ? friends.filter(f => 
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        f.username.toLowerCase().includes(searchTerm.toLowerCase())
      ).map(f => f.id)
    : undefined;

  // --- 1. AUTH & INIT ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if(session?.user) initUserProfile(session.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if(session?.user) initUserProfile(session.user);
      else setCurrentUser(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const initUserProfile = async (authUser: any) => {
    try {
      const { data: profile } = await supabase.from('users').select('*').eq('id', authUser.id).single();
      
      if (!profile) {
        // Create new profile if it doesn't exist
        const newProfile = {
          id: authUser.id,
          email: authUser.email,
          name: authUser.user_metadata?.name || authUser.email.split('@')[0],
          username: (authUser.user_metadata?.username || authUser.email.split('@')[0]).toLowerCase(),
          profile_image: null,
          is_tracking_enabled: true
        };
        await supabase.from('users').insert(newProfile);
        setCurrentUser(mapDbUserToAppUser(newProfile));
      } else {
        const { data: loc } = await supabase.from('live_locations').select('*').eq('user_id', authUser.id).single();
        setCurrentUser(mapDbUserToAppUser({...profile, live_locations: loc ? [loc] : []}));
      }

      fetchFriends(authUser.id);
      fetchFriendRequests(authUser.id);
      fetchAlerts(authUser.id);
    } catch (e) { console.error("Profile init error:", e); }
  };

  const fetchFriends = async (userId: string) => {
    try {
      const { data } = await supabase.from('friends')
        .select(`friend:users!friend_id(id, username, name, email, profile_image, last_seen, is_tracking_enabled, live_locations(latitude, longitude, battery_level, updated_at, is_online, accuracy))`)
        .eq('user_id', userId);

      if (data) setFriends(data.map((item: any) => mapDbUserToAppUser(item.friend)));
    } catch (e) { console.error("Error fetching friends:", e); }
  };

  // --- FETCH PENDING REQUESTS ---
  const fetchFriendRequests = async (userId: string) => {
    try {
      // Use requester_id for join based on foreign key
      const { data, error } = await supabase
        .from("friend_requests")
        .select("*, sender:users!requester_id(*)") // Joined via requester_id
        .eq("receiver_id", userId)
        .eq("status", "pending");

      if (error) throw error;

      if (data) {
        const requests: FriendRequest[] = data.map((req: any) => ({
            id: req.id,
            requester_id: req.requester_id, // Mapped from requester_id column
            receiver_id: req.receiver_id,
            status: req.status,
            created_at: req.created_at,
            sender: req.sender ? mapDbUserToAppUser(req.sender) : undefined
        }));
        setFriendRequests(requests);
      }
    } catch (e) { console.error("Error fetching friend requests:", e); }
  };

  const fetchAlerts = async (userId: string) => {
    try {
      const { data } = await supabase.from('alerts').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20);
      if(data) {
        setAlerts(data.map((a: any) => ({
          id: a.id,
          type: a.type || 'SYSTEM',
          title: a.type === 'SOS' ? 'SOS ALERT' : 'Notification',
          message: a.message,
          timestamp: a.created_at,
          isRead: a.is_read,
          priority: a.type === 'SOS' ? 'HIGH' : 'LOW'
        })));
      }
    } catch (e) { console.error(e); }
  };

  // --- 2. REALTIME SUBSCRIPTIONS ---
  useEffect(() => {
    if(!session?.user) return;
    const channel = supabase.channel('public:live_locations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_locations' }, (payload) => {
         setFriends(currentFriends => currentFriends.map(f => {
             if(f.id === payload.new.user_id) {
               return {
                 ...f,
                 batteryLevel: payload.new.battery_level,
                 status: payload.new.is_online ? UserStatus.ONLINE : UserStatus.OFFLINE,
                 location: {
                   lat: payload.new.latitude,
                   lng: payload.new.longitude,
                   timestamp: new Date(payload.new.updated_at).getTime(),
                   accuracy: payload.new.accuracy
                 }
               }
             }
             return f;
           }));
      }).subscribe();
      
    // Subscribe to Friend Requests for realtime updates
    const requestsChannel = supabase.channel('public:friend_requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friend_requests', filter: `receiver_id=eq.${session.user.id}` }, () => {
          fetchFriendRequests(session.user.id);
      })
      .subscribe();

    return () => { 
        supabase.removeChannel(channel); 
        supabase.removeChannel(requestsChannel);
    };
  }, [session]);

  // --- 3. LOCATION TRACKING ---
  const startTracking = useCallback(() => {
    if (!session || !hasOnboarded) return;
    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        setLocationDenied(false);
        const { latitude, longitude, accuracy } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        
        if (currentUser?.isSharing) {
            try {
                await supabase.from('live_locations').upsert({
                    user_id: session.user.id,
                    latitude,
                    longitude,
                    accuracy,
                    battery_level: 100,
                    is_online: true,
                    updated_at: new Date().toISOString()
                });
            } catch (e) { console.error("Location sync error:", e); }
        }
      },
      (error) => {
        console.error("Location error:", error);
        if (error.code === 1) setLocationDenied(true);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 5000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [session, hasOnboarded, currentUser?.isSharing]);

  useEffect(() => {
      const cleanup = startTracking();
      return () => { if (cleanup) cleanup(); };
  }, [startTracking]);

  // --- 4. ACTIONS ---
  const handleAddFriend = async (identifier: string) => {
    if (!session?.user) return;
    try {
      const searchLower = identifier.toLowerCase(); 
      const { data: users } = await supabase
        .from('users')
        .select('id')
        .or(`email.ilike.${searchLower},username.ilike.${searchLower}`);

      if(users && users.length > 0) {
        if (users[0].id === session.user.id) {
            alert("You cannot add yourself.");
            return;
        }

        const isAlreadyFriend = friends.some(f => f.id === users[0].id);
        if (isAlreadyFriend) {
            alert("Already in your friends list.");
            return;
        }

        // Check for existing pending request to avoid duplicates
        // Use requester_id instead of sender_id
        const { data: existingRequest } = await supabase
            .from('friend_requests')
            .select('*')
            .eq('requester_id', session.user.id) 
            .eq('receiver_id', users[0].id)
            .eq('status', 'pending')
            .single();

        if (existingRequest) {
            alert("Friend request already sent.");
            return;
        }

        // Insert into Friend Requests table using requester_id
        const { error } = await supabase.from('friend_requests').insert({ 
            requester_id: session.user.id, 
            receiver_id: users[0].id,
            status: 'pending'
        });

        if (error) throw error;
        alert(`Friend request sent to ${identifier}`);
      } else {
        alert("User not found");
      }
    } catch(e: any) { console.error(e); alert("Error sending request: " + e.message); }
  };

  const handleAcceptRequest = async (request: FriendRequest) => {
      if (!session?.user) return;
      try {
          // 1. Update request status
          await supabase.from('friend_requests').update({ status: 'accepted' }).eq('id', request.id);
          
          // 2. Add entries to 'friends' table (Mutual)
          await supabase.from('friends').insert([
              { user_id: session.user.id, friend_id: request.requester_id },
              { user_id: request.requester_id, friend_id: session.user.id }
          ]);

          // Refresh lists
          fetchFriendRequests(session.user.id);
          fetchFriends(session.user.id);
      } catch (e) { console.error(e); }
  };

  const handleDeclineRequest = async (requestId: string) => {
      try {
          await supabase.from('friend_requests').update({ status: 'rejected' }).eq('id', requestId);
          if (session?.user) fetchFriendRequests(session.user.id);
      } catch (e) { console.error(e); }
  };

  const handleDismissAlert = async (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
    await supabase.from('alerts').update({ is_read: true }).eq('id', id);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setCurrentUser(null);
    setFriends([]);
  };

  const toggleSharing = async (val: boolean) => {
    if(!currentUser || !session) return;
    setCurrentUser({...currentUser, isSharing: val});
    await supabase.from('users').update({ is_tracking_enabled: val }).eq('id', session.user.id);
  };

  const handleUpdateProfile = async (updates: Partial<User>) => {
    if (!currentUser || !session) return;

    const finalUpdates = { ...updates };
    if (finalUpdates.username) {
        finalUpdates.username = finalUpdates.username.toLowerCase();
    }

    if (finalUpdates.username && finalUpdates.username !== currentUser.username) {
        const { data: existing } = await supabase.from('users').select('id').ilike('username', finalUpdates.username);
        if (existing && existing.length > 0) {
            alert("Username already taken.");
            return;
        }
    }

    setCurrentUser({ ...currentUser, ...finalUpdates });
    const dbUpdates: any = {};
    if (finalUpdates.name) dbUpdates.name = finalUpdates.name;
    if (finalUpdates.username) dbUpdates.username = finalUpdates.username;
    if (finalUpdates.avatar !== undefined) dbUpdates.profile_image = finalUpdates.avatar || null;
    
    await supabase.from('users').update(dbUpdates).eq('id', session.user.id);
  };

  // --- MAP CONTROLS ---
  const handleRecenter = () => {
    if (userLocation && mapInstance) {
        mapInstance.flyTo([userLocation.lat, userLocation.lng], 15);
    }
  };

  const handleZoomIn = () => mapInstance?.zoomIn();
  const handleZoomOut = () => mapInstance?.zoomOut();
  const handleToggleLayers = () => setMapType(prev => prev === 'street' ? 'satellite' : 'street');

  const handleLocateFriend = (friend: User) => {
    if(friend.location) {
        setActiveTab('map');
        setTimeout(() => {
            if(mapInstance) {
                mapInstance.flyTo([friend.location.lat, friend.location.lng], 16);
            }
        }, 100);
    } else {
        alert("Friend's location is unavailable.");
    }
  };

  if (!session) return <AuthScreen onLogin={() => {}} />;
  if (!hasOnboarded) return <OnboardingScreen onComplete={() => setHasOnboarded(true)} />;
  if (locationDenied) return <LocationBlockerScreen onRetry={() => window.location.reload()} />;

  return (
    // Main Background for the whole app
    <div className="h-[100dvh] w-full bg-[#f0f9ff] dark:bg-[#05080a] relative overflow-hidden font-sans transition-colors duration-300">
        
      {/* Background Ambience Gradient */}
      <div className="absolute top-0 left-0 w-full h-[50%] bg-gradient-to-b from-[#e0f7fa]/60 to-transparent dark:from-[#0f2e2e]/40 dark:to-transparent pointer-events-none z-0 transition-colors duration-500"></div>

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onLogout={handleLogout}
        currentUser={currentUser}
      />

      {/* MAP TAB CONTENT */}
      {activeTab === 'map' && currentUser && (
        <div className="h-full w-full relative z-0">
          <TopSearchBar 
            currentUser={currentUser} 
            onMenuClick={() => setIsSidebarOpen(true)}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
          <MapView 
            currentUser={{...currentUser, location: userLocation ? { ...userLocation, timestamp: Date.now(), accuracy: 0 } : undefined}} 
            friends={friends} 
            userLocation={userLocation || (currentUser.location ? { lat: currentUser.location.lat, lng: currentUser.location.lng } : { lat: 37.7749, lng: -122.4194 })} 
            onMapReady={setMapInstance}
            mapType={mapType}
            filteredFriendIds={filteredFriendIds}
          />
          <FloatingMapControls 
            onRecenter={handleRecenter}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onToggleLayers={handleToggleLayers}
            mapType={mapType}
          />
        </div>
      )}

      {/* OTHER TABS */}
      {activeTab === 'friends' && (
        <FriendsView 
          friends={friends} 
          friendRequests={friendRequests}
          onAddFriend={handleAddFriend} 
          currentUser={currentUser}
          onLocateFriend={handleLocateFriend}
          onOpenMenu={() => setIsSidebarOpen(true)}
          onAcceptRequest={handleAcceptRequest}
          onDeclineRequest={handleDeclineRequest}
        />
      )}
      
      {activeTab === 'alerts' && (
        <AlertsView 
          alerts={alerts} 
          onDismiss={handleDismissAlert} 
        />
      )}

      {activeTab === 'settings' && (
        <SettingsView 
          isSharing={currentUser?.isSharing || false} 
          onToggleSharing={toggleSharing} 
          onLogout={handleLogout}
          currentUser={currentUser}
          onUpdateProfile={handleUpdateProfile}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}

      {/* GLOBAL BOTTOM NAV */}
      <BottomNav 
        currentTab={activeTab} 
        onTabChange={setActiveTab} 
        alertCount={alerts.filter(a => !a.isRead).length + friendRequests.length} 
      />
    </div>
  );
};

export default App;
