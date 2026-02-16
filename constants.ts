import { User, UserStatus, Alert } from './types';

export const MOCK_CURRENT_USER: User = {
  id: 'me',
  username: 'me',
  name: 'Me',
  avatar: 'https://i.pravatar.cc/150?u=me',
  email: 'user@trackmate.app',
  batteryLevel: 92,
  status: UserStatus.ONLINE,
  lastSeen: new Date(),
  isSharing: true,
};

export const MOCK_FRIENDS: User[] = [
  {
    id: 'f1',
    username: 'alex',
    name: 'Alex',
    avatar: 'https://i.pravatar.cc/150?u=alex',
    email: 'alex@trackmate.app',
    batteryLevel: 85,
    status: UserStatus.ONLINE,
    lastSeen: new Date(Date.now() - 1000 * 60 * 2), // 2m ago
    isSharing: true,
    location: { lat: 37.7938, lng: -122.4040, timestamp: Date.now() } // SF North Beach
  },
  {
    id: 'f2',
    username: 'jordan',
    name: 'Jordan',
    avatar: 'https://i.pravatar.cc/150?u=jordan',
    email: 'jordan@trackmate.app',
    batteryLevel: 12,
    status: UserStatus.MOVING,
    lastSeen: new Date(), // Just now
    isSharing: true,
    location: { lat: 37.7550, lng: -122.4200, timestamp: Date.now() } // SF Mission
  },
  {
    id: 'f3',
    username: 'taylor',
    name: 'Taylor',
    avatar: 'https://i.pravatar.cc/150?u=taylor',
    email: 'taylor@trackmate.app',
    batteryLevel: 45,
    status: UserStatus.OFFLINE,
    lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4h ago
    isSharing: true,
    location: { lat: 37.7600, lng: -122.4400, timestamp: Date.now() } // Home
  },
  {
    id: 'f4',
    username: 'jamie',
    name: 'Jamie',
    avatar: 'https://i.pravatar.cc/150?u=jamie',
    email: 'jamie@trackmate.app',
    batteryLevel: 98,
    status: UserStatus.ONLINE,
    lastSeen: new Date(Date.now() - 1000 * 60 * 15), // 15m ago
    isSharing: true,
    location: { lat: 37.7800, lng: -122.4100, timestamp: Date.now() } // Gym
  }
];

export const MOCK_ALERTS: Alert[] = [
  {
    id: 'a1',
    type: 'SOS',
    title: 'SOS Alert',
    message: 'Alex triggered an SOS\nImmediate assistance requested near Union Square. Tap to see precise location.',
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
    isRead: false,
    priority: 'HIGH'
  },
  {
    id: 'a2',
    type: 'ARRIVAL',
    title: 'ARRIVED',
    message: 'Jordan arrived at Home\nBattery is at 12% and needs charging soon.',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    isRead: true,
    priority: 'MEDIUM'
  },
  {
    id: 'a3',
    type: 'SYSTEM',
    title: 'STATUS UPDATE',
    message: 'Alex\'s battery is critical\nPhone battery dropped below 5%. Location sharing might stop soon.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20),
    isRead: true,
    priority: 'LOW'
  }
];
