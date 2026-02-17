-- =====================================================
-- LOCATION SHARING APP - PRODUCTION SCHEMA
-- =====================================================

-- Enable required extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- DROP TABLES (Safe Reset)
-- =====================================================

DROP TABLE IF EXISTS public.alerts CASCADE;
DROP TABLE IF EXISTS public.friend_requests CASCADE;
DROP TABLE IF EXISTS public.friends CASCADE;
DROP TABLE IF EXISTS public.live_locations CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- =====================================================
-- USERS TABLE
-- =====================================================

CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  profile_image TEXT,
  is_tracking_enabled BOOLEAN DEFAULT true,
  last_seen TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_users_username ON public.users(username);

-- =====================================================
-- FRIENDS TABLE (Bidirectional)
-- =====================================================

CREATE TABLE public.friends (
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, friend_id),
  CHECK (user_id <> friend_id)
);

CREATE INDEX idx_friends_user_id ON public.friends(user_id);
CREATE INDEX idx_friends_friend_id ON public.friends(friend_id);

-- =====================================================
-- FRIEND REQUESTS
-- =====================================================

CREATE TABLE public.friend_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending','accepted','rejected')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(requester_id, receiver_id),
  CHECK (requester_id <> receiver_id)
);

CREATE INDEX idx_friend_requests_receiver ON public.friend_requests(receiver_id);
CREATE INDEX idx_friend_requests_requester ON public.friend_requests(requester_id);

-- =====================================================
-- LIVE LOCATIONS
-- =====================================================

CREATE TABLE public.live_locations (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  accuracy DOUBLE PRECISION,
  battery_level INTEGER,
  is_online BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_live_locations_updated ON public.live_locations(updated_at);

-- =====================================================
-- ALERTS
-- =====================================================

CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT,
  title TEXT,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_alerts_user_id ON public.alerts(user_id);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USERS POLICIES
-- =====================================================

CREATE POLICY "Users are viewable by everyone"
ON public.users FOR SELECT
USING (true);

CREATE POLICY "Users insert own profile"
ON public.users FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users update own profile"
ON public.users FOR UPDATE
USING (auth.uid() = id);

-- =====================================================
-- FRIENDS POLICIES
-- =====================================================

CREATE POLICY "Users view own friends"
ON public.friends FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users insert friendships"
ON public.friends FOR INSERT
WITH CHECK (auth.uid() = user_id OR auth.uid() = friend_id);

-- =====================================================
-- FRIEND REQUEST POLICIES
-- =====================================================

CREATE POLICY "Users view sent or received requests"
ON public.friend_requests FOR SELECT
USING (
  auth.uid() = requester_id OR
  auth.uid() = receiver_id
);

CREATE POLICY "Users create friend request"
ON public.friend_requests FOR INSERT
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Receiver updates request"
ON public.friend_requests FOR UPDATE
USING (auth.uid() = receiver_id);

-- =====================================================
-- LIVE LOCATION POLICIES
-- =====================================================

CREATE POLICY "Users view own or friends location"
ON public.live_locations FOR SELECT
USING (
  auth.uid() = user_id
  OR (
    EXISTS (
      SELECT 1 FROM public.friends
      WHERE friends.user_id = auth.uid()
      AND friends.friend_id = live_locations.user_id
    )
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = live_locations.user_id
      AND users.is_tracking_enabled = true
    )
  )
);

CREATE POLICY "Users insert own location"
ON public.live_locations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own location"
ON public.live_locations FOR UPDATE
USING (auth.uid() = user_id);

-- =====================================================
-- ALERT POLICIES
-- =====================================================

CREATE POLICY "Users view own alerts"
ON public.alerts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users insert alerts"
ON public.alerts FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users update own alerts"
ON public.alerts FOR UPDATE
USING (auth.uid() = user_id);

-- =====================================================
-- AUTO PROFILE CREATION TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, username, name)
  VALUES (
    NEW.id,
    NEW.email,
    LOWER(split_part(NEW.email, '@', 1)),
    split_part(NEW.email, '@', 1)
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE PROCEDURE public.handle_new_user();
