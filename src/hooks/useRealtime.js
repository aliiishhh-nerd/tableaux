// src/hooks/useRealtime.js
// Subscribes to Supabase Realtime channels for live RSVP and event notifications
// Drop this into AppProvider or wrap AppShell — it fires addToast + addNotification
// on new RSVPs to your events and on RSVP status changes for events you've joined

import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useRealtime({ user, addToast, addNotification, setEvents }) {
  useEffect(() => {
    if (!user?.id || user.id.startsWith('u')) return; // skip seed/demo users

    const channels = [];

    // ── Channel 1: New RSVPs on events you host ─────────────────────────────
    const rsvpChannel = supabase
      .channel('host-rsvps-' + user.id)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'rsvps',
          filter: `event_id=in.(select id from events where host_id=eq.${user.id})`,
        },
        async (payload) => {
          const rsvp = payload.new;
          // Fetch guest name
          let guestName = 'A guest';
          try {
            const { data } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', rsvp.guest_id)
              .single();
            if (data?.full_name) guestName = data.full_name;
          } catch {}

          addToast(`${guestName} requested to join your event 🔔`, 'info');
          if (typeof addNotification === 'function') {
            addNotification({
              id: 'rt-' + Date.now(),
              type: 'new_rsvp',
              message: `${guestName} requested to join your event`,
              eventId: rsvp.event_id,
              read: false,
              createdAt: new Date().toISOString(),
            });
          }

          // Update guest list in local state
          if (typeof setEvents === 'function') {
            setEvents(prev => prev.map(ev => {
              if (ev.id !== rsvp.event_id) return ev;
              const exists = (ev.guests || []).find(g => g.id === rsvp.guest_id);
              if (exists) return ev;
              return {
                ...ev,
                guests: [...(ev.guests || []), {
                  id: rsvp.guest_id,
                  n: guestName,
                  s: rsvp.status || 'pending',
                  initials: guestName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
                  color: 'indigo',
                }],
              };
            }));
          }
        }
      )
      .subscribe();

    channels.push(rsvpChannel);

    // ── Channel 2: RSVP status changes for events you've joined ────────────
    const myRsvpChannel = supabase
      .channel('my-rsvp-status-' + user.id)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rsvps',
          filter: `guest_id=eq.${user.id}`,
        },
        async (payload) => {
          const rsvp = payload.new;
          if (rsvp.status === 'approved') {
            // Fetch event title
            let eventTitle = 'an event';
            try {
              const { data } = await supabase
                .from('events')
                .select('title')
                .eq('id', rsvp.event_id)
                .single();
              if (data?.title) eventTitle = data.title;
            } catch {}

            addToast(`You're in! Your RSVP to ${eventTitle} was approved 🎉`, 'success');
            if (typeof addNotification === 'function') {
              addNotification({
                id: 'rt-' + Date.now(),
                type: 'rsvp_approved',
                message: `Your RSVP to ${eventTitle} was approved`,
                eventId: rsvp.event_id,
                read: false,
                createdAt: new Date().toISOString(),
              });
            }

            // Update local event guest status
            if (typeof setEvents === 'function') {
              setEvents(prev => prev.map(ev => {
                if (ev.id !== rsvp.event_id) return ev;
                return {
                  ...ev,
                  guests: (ev.guests || []).map(g =>
                    g.id === user.id ? { ...g, s: 'approved' } : g
                  ),
                };
              }));
            }
          } else if (rsvp.status === 'declined') {
            addToast('Your RSVP request was not approved this time.', '');
          }
        }
      )
      .subscribe();

    channels.push(myRsvpChannel);

    // ── Channel 3: New public events in your city ───────────────────────────
    const newEventsChannel = supabase
      .channel('new-events-' + user.id)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'events',
          filter: `city=eq.${user.city || 'Chicago'}`,
        },
        (payload) => {
          const ev = payload.new;
          if (ev.host_id === user.id) return; // don't notify about own events
          if (ev.visibility !== 'public') return; // only public events

          addToast(`New event in ${ev.city || 'your city'}: ${ev.title} 🍽️`, 'info');
        }
      )
      .subscribe();

    channels.push(newEventsChannel);

    // Cleanup all channels on unmount or user change
    return () => {
      channels.forEach(ch => supabase.removeChannel(ch));
    };
  }, [user?.id, user?.city, addToast, addNotification, setEvents]);
}
