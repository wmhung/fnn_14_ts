'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { driver, type DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';

// Keep in sync with the "Sign in as demo" account in LoginForm.tsx.
const GUEST_EMAIL = 'guest@email.com';
const SEEN_KEY = 'fnn_guest_tour_seen';

const STEPS: DriveStep[] = [
  {
    popover: {
      title: '👋 Welcome to FNN',
      description:
        'A 60-second tour of Finding Next Neverland — a family park tracker. Hit Next, or close anytime.',
    },
  },
  {
    element: '[data-tour="find-parks"]',
    popover: {
      title: '🌳 Find parks near you',
      description:
        'Pulls real parks & playgrounds around your current position.',
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '[data-tour="map"]',
    popover: {
      title: '🗺️ The map',
      description:
        'Everything renders here. Tap a green pin to save a found park, or click anywhere to drop your own place.',
      side: 'left',
      align: 'center',
    },
  },
  {
    element: '[data-tour="place-card"]',
    popover: {
      title: '📍 Your saved places',
      description:
        'Open one for full details, a walking route, and its visit history — and to log a repeat visit.',
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '[data-tour="bookmark"]',
    popover: {
      title: '⭐ One-click favourite',
      description: 'Toggling a bookmark and the pin turns gold.',
      side: 'right',
      align: 'start',
    },
  },
  {
    popover: {
      title: '🚀 That’s the tour',
      description: 'Enjoy exploring!',
    },
  },
];

export default function GuestTour({ email }: { email?: string | null }) {
  const pathname = usePathname();
  const isGuest = email === GUEST_EMAIL;
  const [ready, setReady] = useState(false);
  const startedRef = useRef(false);

  const startTour = useCallback(() => {
    // Only include steps whose target exists (or that have no target), so a
    // missing element never breaks or freezes the walkthrough.
    const steps = STEPS.filter(
      (s) => !s.element || document.querySelector(s.element as string),
    );
    if (steps.length === 0) return;

    driver({
      showProgress: true,
      allowClose: true,
      overlayColor: 'rgba(2, 6, 23, 0.6)',
      popoverClass: 'fnn-tour-popover',
      nextBtnText: 'Next →',
      prevBtnText: '← Back',
      doneBtnText: 'Done',
      steps,
    }).drive();
  }, []);

  // Bump the popover text size — driver.js defaults look small on big screens.
  useEffect(() => {
    if (!isGuest || document.getElementById('fnn-tour-style')) return;
    const style = document.createElement('style');
    style.id = 'fnn-tour-style';
    style.textContent = `
      .driver-popover.fnn-tour-popover { max-width: 360px; padding: 22px 24px; }
      .fnn-tour-popover .driver-popover-title { font-size: 1.3rem; line-height: 1.35; }
      .fnn-tour-popover .driver-popover-description { font-size: 1.075rem; line-height: 1.65; }
      .fnn-tour-popover .driver-popover-progress-text { font-size: 0.9rem; }
      .fnn-tour-popover .driver-popover-navigation-btns button { font-size: 0.95rem; padding: 6px 12px; }
      .fnn-tour-popover .driver-popover-close-btn { font-size: 1.4rem; }
    `;
    document.head.appendChild(style);
  }, [isGuest]);

  // Auto-start once per session on the main list page, after the map mounts.
  useEffect(() => {
    if (!isGuest || pathname !== '/placelist' || startedRef.current) return;
    if (sessionStorage.getItem(SEEN_KEY)) {
      setReady(true); // already seen → just show the replay button
      return;
    }

    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      const mapReady = document.querySelector('[data-tour="find-parks"]');
      if (mapReady || tries > 20) {
        clearInterval(timer);
        startedRef.current = true;
        sessionStorage.setItem(SEEN_KEY, '1');
        setReady(true);
        startTour();
      }
    }, 250); // poll up to ~5s for the map to render

    return () => clearInterval(timer);
  }, [isGuest, pathname, startTour]);

  if (!isGuest || !ready) return null;

  // Replay button — guest-only, unobtrusive, bottom-left.
  return (
    <button
      type='button'
      onClick={startTour}
      className='fixed bottom-5 left-5 z-[60] rounded-full border border-accent-500 bg-white/90 px-4 py-2 text-sm font-semibold text-accent-600 shadow-lg backdrop-blur transition hover:bg-accent-500/10 dark:bg-slate-900/90 dark:text-accent-400'
    >
      ？ Take the tour
    </button>
  );
}
