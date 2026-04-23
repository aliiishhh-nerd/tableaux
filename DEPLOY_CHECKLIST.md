# Deploy Checklist

Run through this before every `git push origin main`. No exceptions — this is what catches mistakes before they ship to users.

## Pre-patch

- [ ] Bug is reproducible (or feature is specified). Write down the exact reproduction steps.
- [ ] Mechanism is understood — I can explain *why* the code behaves this way, not just where.
- [ ] Plan is scoped to **one testable change**. If I'm touching more than one concern, split into separate commits.

## Before writing code

- [ ] Read each file I'm about to edit with `Read` — not from memory, not from a cached summary.
- [ ] Identify exact substring(s) I'll target with `Edit`.
- [ ] If a UI change: describe the change or show a mockup. Wait for approval.

## After code change, before commit

- [ ] `CI=true npx eslint --max-warnings 0 <edited-files>` — passes
- [ ] `CI=true npm run build` — compiles cleanly, no new warnings
- [ ] Manual sanity: open the app locally (`npm start`) and verify the change does what I claimed. *If I can't run it locally, say so.*
- [ ] `git diff` the changes and read each line — does anything look wrong?

## Commit

- [ ] Commit message is specific and describes the **one** change. ("Fix guest count on EventDetailModal" ✓. "RSVP + UI fixes" ✗.)
- [ ] No unrelated files staged. `git status` shows only the files I meant to change.

## After push

- [ ] Note the commit hash and pre-push bundle hash.
- [ ] Wait 90–120 seconds for Netlify build.
- [ ] Hard-refresh `tablefolk.club` (Cmd+Shift+R). Bundle hash should flip.
- [ ] Run the **verification step** for this change. Every change should have one defined before push. If there isn't one, I haven't thought about the change hard enough.
- [ ] If verification passes, mark it done in the task list.
- [ ] If verification fails, **revert the commit** before starting new work: `git revert HEAD && git push origin main`. Don't stack fixes on broken ground.

## When not to deploy

- [ ] End of session without time to verify → don't push. Hold it locally.
- [ ] Uncertain whether the change is right → don't push. Ask.
- [ ] I notice `.bak` files, stray console.logs, or TODO comments → clean up first.
- [ ] Working tree has unrelated staged changes → stash, commit clean, then unstash.

## Sensitive touchpoints that need extra care

- Files in `src/hooks/useApp.js`, `src/hooks/useRealtime.js`, `src/lib/supabase.js`, and anything touching RSVP state — changes here have caused every production regression in the last two weeks. Extra pairs of eyes on the diff.
- Auth flows, `isRealUser` gating, seed user handling — breaking these silently breaks all real users.
- RLS-sensitive paths (anything that queries or mutates `rsvps`, `events`, `profiles`) — verify with Test1/Test3/Test5 accounts, not just seed users.

---

_If the checklist feels like overhead, that's because last time we skipped it we shipped a bug we didn't notice for 24 hours. The checklist is cheaper than the bug._
