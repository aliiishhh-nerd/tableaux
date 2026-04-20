// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

export const signUp = async (email, password, fullName) => {
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getSession = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session;
};

export const getProfile = async (userId) => {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) throw error;
  return data;
};

// Maps app field names to Supabase column names
export const updateProfile = async (userId, updates) => {
  const mapped = {};
  if (updates.name !== undefined)                 mapped.full_name = updates.name;
  if (updates.full_name !== undefined)             mapped.full_name = updates.full_name;
  if (updates.avatar !== undefined)               mapped.avatar_url = updates.avatar;
  if (updates.avatar_url !== undefined)           mapped.avatar_url = updates.avatar_url;
  if (updates.bio !== undefined)                  mapped.bio = updates.bio;
  if (updates.city !== undefined)                 mapped.city = updates.city;
  if (updates.website !== undefined)              mapped.website = updates.website;
  if (updates.handle !== undefined)               mapped.handle = updates.handle;
  if (updates.favoriteFood !== undefined)         mapped.favorite_food = updates.favoriteFood;
  if (updates.favoriteRestaurant !== undefined)   mapped.favorite_restaurant = updates.favoriteRestaurant;
  if (updates.dietaryRestrictions !== undefined)  mapped.dietary_restrictions = updates.dietaryRestrictions;
  if (Object.keys(mapped).length === 0) return null;
  const { data, error } = await supabase.from('profiles').update(mapped).eq('id', userId).select().single();
  if (error) throw error;
  return data;
};

export const getPublicEvents = async ({ city } = {}) => {
  let query = supabase
    .from('events')
    .select('*, host:profiles(id, full_name, avatar_url, username), rsvp_count:rsvps(count)')
    .eq('status', 'published')
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: true });
  if (city) query = query.eq('city', city);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

export const getEventById = async (eventId) => {
  const { data, error } = await supabase
    .from('events')
    .select('*, host:profiles(id, full_name, avatar_url, username, bio), rsvps(*, guest:profiles(id, full_name, avatar_url)), potluck_items(*), moments(*, author:profiles(id, full_name, avatar_url))')
    .eq('id', eventId)
    .single();
  if (error) throw error;
  return data;
};

export const getHostEvents = async (hostId) => {
  const { data, error } = await supabase
    .from('events')
    .select('*, rsvps(*, guest:profiles(id, full_name, avatar_url))')
    .eq('host_id', hostId)
    .order('date', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const createEvent = async (eventData) => {
  const { data, error } = await supabase.from('events').insert(eventData).select().single();
  if (error) throw error;
  return data;
};

export const createRsvp = async (eventId, guestId, message = '') => {
  const { data, error } = await supabase
    .from('rsvps')
    .upsert({ event_id: eventId, guest_id: guestId, message, status: 'pending' }, { onConflict: 'event_id,guest_id' })
    .select().single();
  if (error) throw error;
  return data;
};

export const updateRsvpStatus = async (rsvpId, status) => {
  const { data, error } = await supabase.from('rsvps').update({ status }).eq('id', rsvpId).select().single();
  if (error) throw error;
  return data;
};

export const getGuestRsvps = async (guestId) => {
  const { data, error } = await supabase
    .from('rsvps')
    .select('*, event:events(*, host:profiles(id, full_name, avatar_url))')
    .eq('guest_id', guestId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const getPotluckItems = async (eventId) => {
  const { data, error } = await supabase
    .from('potluck_items')
    .select('*, claimed_by:profiles(id, full_name, avatar_url)')
    .eq('event_id', eventId);
  if (error) throw error;
  return data;
};

export const addMoment = async (eventId, authorId, imageUrl, caption) => {
  const { data, error } = await supabase
    .from('moments')
    .insert({ event_id: eventId, author_id: authorId, image_url: imageUrl, caption })
    .select().single();
  if (error) throw error;
  return data;
};

export const getPassportStamps = async (userId) => {
  const { data, error } = await supabase
    .from('passport_stamps')
    .select('*, event:events(title)')
    .eq('user_id', userId)
    .order('awarded_at', { ascending: false });
  if (error) throw error;
  return data;
};

// ── Friendships ──────────────────────────────────────────────────────────────

export const getFriendships = async (userId) => {
  const { data, error } = await supabase
    .from('friendships')
    .select('*, friend:profiles!friendships_friend_id_fkey(id, full_name, avatar_url, username, bio, city)')
    .eq('user_id', userId);
  if (error) throw error;
  return data || [];
};

export const sendFriendRequestDb = async (userId, friendId) => {
  const { data, error } = await supabase
    .from('friendships')
    .upsert({ user_id: userId, friend_id: friendId, status: 'pending' }, { onConflict: 'user_id,friend_id' })
    .select().single();
  if (error) throw error;
  return data;
};

export const acceptFriendRequestDb = async (userId, friendId) => {
  // Accept in both directions
  await supabase.from('friendships')
    .update({ status: 'accepted' })
    .eq('user_id', friendId).eq('friend_id', userId);
  const { data, error } = await supabase.from('friendships')
    .upsert({ user_id: userId, friend_id: friendId, status: 'accepted' }, { onConflict: 'user_id,friend_id' })
    .select().single();
  if (error) throw error;
  return data;
};

export const removeFriendDb = async (userId, friendId) => {
  await supabase.from('friendships').delete().eq('user_id', userId).eq('friend_id', friendId);
  await supabase.from('friendships').delete().eq('user_id', friendId).eq('friend_id', userId);
};

// ── Waitlist ─────────────────────────────────────────────────────────────────

export const addToWaitlist = async (email, city, intent) => {
  const { data, error } = await supabase
    .from('waitlist')
    .insert({ email, city, intent })
    .select().single();
  if (error) throw error;
  return data;
};

export const getWaitlistCount = async (city = 'Chicago') => {
  try {
    const { count, error } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })
      .ilike('city', city);
    if (error) return 0;
    return count || 0;
  } catch {
    return 0;
  }
};
