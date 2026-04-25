// src/hooks/useOpenEventFromQuery.js
// Reads ?openEvent=<eventId> from the URL, finds the matching event in
// the supplied events array, calls setSelected to open the modal, and
// clears the param. Re-runs when events update so a deep-link that
// arrives before loadAllData completes still opens the modal once
// data lands.

import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useOpenEventFromQuery(events, setSelected) {
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    const id = searchParams.get('openEvent');
    if (!id) return;
    const ev = (events || []).find(e => e.id === id);
    if (!ev) return;
    setSelected(ev);
    const next = new URLSearchParams(searchParams);
    next.delete('openEvent');
    setSearchParams(next, { replace: true });
  }, [searchParams, events, setSelected, setSearchParams]);
}
