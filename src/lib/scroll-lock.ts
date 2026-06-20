// Force the document to a target scroll position and HOLD it, then keep
// scroll-snap DISABLED until the user next touches the screen.
//
// Why not just scroll and restore snap on a timer? On iOS Safari, when a touch
// gesture ends on a snap point (e.g. the footer), the engine remembers that
// point and re-applies a "deferred snap" to it the instant snap-type is active
// again — verified on a real device: a programmatic jump to the top lands, then
// ~50ms after snap is restored the page slides back to the footer. A fixed
// timer only postpones that revert; the engine waits it out. The reliable cure
// is to leave snap off until the NEXT touchstart, which begins a fresh gesture
// and clears the stale deferred snap. While parked at the target with snap off,
// nothing pulls the page away; once the user scrolls, snap is back to normal.
//
// The <html> element and window persist across ClientRouter swaps, so any hold
// is also torn down on navigation — otherwise the disabled-snap style and the
// pending listener would leak onto the next page.

let activeRaf: number | null = null;
let teardown: (() => void) | null = null;
let swapListenerAttached = false;

function endHold(): void {
  if (activeRaf !== null) {
    cancelAnimationFrame(activeRaf);
    activeRaf = null;
  }
  if (teardown) {
    teardown();
    teardown = null;
  }
}

export function lockScrollTo(targetY: number, holdMs = 600): void {
  if (typeof window === 'undefined') return;

  if (!swapListenerAttached) {
    document.addEventListener('astro:before-swap', endHold);
    swapListenerAttached = true;
  }
  endHold(); // abort + restore any prior hold; only one runs at a time

  const root = document.documentElement;
  const prevSnap = root.style.scrollSnapType;
  const prevBehavior = root.style.scrollBehavior;
  root.style.scrollSnapType = 'none';
  root.style.scrollBehavior = 'auto';

  // Restore snap on the user's next scroll gesture (a fresh start), or on
  // navigation. On iOS that gesture is `touchstart` (which also clears the
  // stale deferred snap — the whole reason for the touch trigger). Desktop
  // never fires touchstart, so also listen for `wheel`/`keydown`; otherwise
  // snap-type stays 'none' forever and the document loses its scroll-snap.
  const restoreEvents = ['touchstart', 'wheel', 'keydown'] as const;
  const onGesture = () => endHold();
  teardown = () => {
    restoreEvents.forEach((e) => window.removeEventListener(e, onGesture));
    root.style.scrollBehavior = prevBehavior;
    root.style.scrollSnapType = prevSnap; // '' → falls back to CSS (mandatory)
  };
  restoreEvents.forEach((e) => window.addEventListener(e, onGesture, { passive: true }));

  // Hold the target briefly, re-asserting each frame. This defeats iOS's
  // post-reload scroll restoration (a separate mechanism from snap that fires
  // shortly after load). After the window we STOP re-asserting but keep snap
  // off — position holds on its own with snap disabled.
  const start = performance.now();
  const tick = () => {
    if (Math.round(window.scrollY) !== targetY) window.scrollTo(0, targetY);
    if (performance.now() - start < holdMs) {
      activeRaf = requestAnimationFrame(tick);
    } else {
      activeRaf = null;
    }
  };
  window.scrollTo(0, targetY);
  activeRaf = requestAnimationFrame(tick);
}
