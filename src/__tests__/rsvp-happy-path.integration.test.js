// Integration test for the RSVP happy path.
//
// Gated behind RUN_INTEGRATION=true so `npm test` doesn't hit prod Supabase.
// To run: `RUN_INTEGRATION=true CI=true npm test`
//
// This test exercises the exact Promise.allSettled concurrent-fetch pattern
// from useApp.js loadAllData — the pattern that the gotrue navigator.locks
// contention bug (fixed 2026-04-23, commit 09235cf) was rejecting. If any of
// the 4 parallel fetches rejects, this test fails, catching that regression.
//
// Writes to prod DB (Test3's rsvp on the test event). afterAll restores the
// original status so the test is state-neutral across runs.

import {
  supabase,
  signIn,
  signOut,
  updateRsvpStatus,
  getHostEvents,
  getGuestRsvps,
  getPublicEvents,
  getFriendships,
} from '../lib/supabase';

const EVENT_ID = 'e328a440-96e8-4799-9995-6e103d9d1c04';

const TEST1 = {
  email: 'hello+test1@tablefolk.club',
  password: 'alicia1',
  id: '4ef11fc7-f592-42a0-98e8-9def487a1324',
};

const TEST3 = {
  email: 'hello+test3@tablefolk.club',
  password: 'alicia1',
  id: 'd1933a51-794e-4f5c-948b-7a9977030531',
};

const RUN = process.env.RUN_INTEGRATION === 'true';
const describeOrSkip = RUN ? describe : describe.skip;

describeOrSkip('RSVP happy path (integration)', () => {
  jest.setTimeout(30000);

  let originalStatus = null;
  let rsvpId;

  beforeAll(async () => {
    await signIn(TEST1.email, TEST1.password);
    const { data } = await supabase
      .from('rsvps')
      .select('id, status')
      .eq('event_id', EVENT_ID)
      .eq('guest_id', TEST3.id)
      .maybeSingle();
    if (!data) {
      throw new Error(
        `Test3 has no rsvp on event ${EVENT_ID}. ` +
        `This integration test expects Test3 to already have an rsvp on the test event. ` +
        `Create one in Supabase before re-running.`
      );
    }
    rsvpId = data.id;
    originalStatus = data.status;
    await signOut();
  });

  afterAll(async () => {
    if (rsvpId && originalStatus) {
      await signIn(TEST1.email, TEST1.password);
      await updateRsvpStatus(rsvpId, originalStatus);
      await signOut();
    }
  });

  test('host approve + loadAllData-style concurrent fetch reflects approved (gotrue lock regression guard)', async () => {
    await signIn(TEST1.email, TEST1.password);
    await updateRsvpStatus(rsvpId, 'approved');

    // Emulate useApp.js loadAllData's concurrent fetch. All 4 must fulfill —
    // the gotrue navigator.locks contention bug would reject 3 of these.
    const [hosted, rsvpd, publicEvts, friendships] = await Promise.allSettled([
      getHostEvents(TEST1.id),
      getGuestRsvps(TEST1.id),
      getPublicEvents({}),
      getFriendships(TEST1.id),
    ]);

    expect(hosted.status).toBe('fulfilled');
    expect(rsvpd.status).toBe('fulfilled');
    expect(publicEvts.status).toBe('fulfilled');
    expect(friendships.status).toBe('fulfilled');

    const event = hosted.value.find(e => e.id === EVENT_ID);
    expect(event).toBeDefined();
    const testRsvp = event.rsvps.find(r => r.guest_id === TEST3.id);
    expect(testRsvp).toBeDefined();
    expect(testRsvp.status).toBe('approved');
  });
});
