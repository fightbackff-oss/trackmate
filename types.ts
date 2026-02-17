
export interface Location {
  lat: number;
  lng: number;
  timestamp: number;
  accuracy?: number;
}

export enum UserStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  MOVING = 'MOVING',
  GHOST_MODE = 'GHOST_MODE'
}

export interface User {
  id: string;
  username: string;
  name: string;
  avatar: string;
  email: string;
  phone?: string;
  location?: Location;
  batteryLevel: number;
  status: UserStatus;
  lastSeen: string | Date;
  isSharing: boolean;
}

export interface FriendRequest {
  id: string;
  requester_id: string; // db column often sender_id, mapped manually or via join
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  sender?: User; // Joined user data
}

export interface Alert {
  id: string;
  type: 'SOS' | 'GEOFENCE' | 'ARRIVAL' | 'SYSTEM';
  title: string;
  message: string;
  timestamp: string | Date;
  isRead: boolean;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  senderId?: string;
}
