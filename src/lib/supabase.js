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

export const updateProfile = async (userId, updates) => {
  const { data, error } = await supabase.from('profiles').update(updates).eq('id', userId).select().single();
  if (error) throw error;
  return data;
};

export const getPublicEvents = async ({ city } = {}) => {
  let query = supabase
    .from('events')
    .select('*, host:profiles(id, full_name, avatar_url, username), rsvp_count:rsvps(count)')
    .eq('is_public', true)
    .eq('status', 'published')
    .gte('date', new Date().toISOString())
    .order('date', { ascending: true });
  if (city) query = query.eq('city', city);
  const { data, error } = await query;
  if (error) throw error;
  return data;
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
    .select('*, rsvps(count)')
    .eq('host_id', hostId)
    .order('date', { ascending: false });
  if (error) throw error;
  return data;
};

export const createEvent = async (eventData) => {
  const { data, error } = await supabase.from('events').insert(eventData).select().single();
  if (error) throw error;
  return data;
};

export const createRsvp = async (eventId, guestId, message = '') => {
  const { data, error } = await supabase.from('rsvps').insert({ event_id: eventId, guest_id: guestId, message }).select().single();
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
    .select('*, event:events(*)')
    .eq('guest_id', guestId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
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
    .select()
    .single();
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

export const addToWaitlist = async (email, city, intent) => {
  const { data, error } = await supabase
    .from('waitlist')
    .insert({ email, city, intent })
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Returns the number of waitlist signups for a given city (case-insensitive match).
// Falls back to 0 on any error so the UI never breaks.
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
