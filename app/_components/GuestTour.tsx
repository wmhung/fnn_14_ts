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
      title: '歡迎來到 FNN',
      description:
        '60 秒帶您認識 Finding Next Neverland，點選「下一步」或隨時關閉。<br/>接下來介紹 4 種新增景點到左側「景點清單」的方式。',
    },
  },
  {
    element: '[data-tour="locate"]',
    popover: {
      title: '方式 1：GPS 定位',
      description:
        '點擊地圖右上方的「定位符號」→ GPS 定位成功 → 填寫表單資料送出 → 成功紀錄座標',
      side: 'left',
      align: 'start',
    },
  },
  {
    element: '[data-tour="map"]',
    popover: {
      title: '方式 2：點擊地圖',
      description:
        '在地圖找到要新增的景點 → 點擊地圖 → 填寫表單資料送出 → 成功紀錄座標',
      side: 'left',
      align: 'center',
    },
  },
  {
    element: '[data-tour="find-parks"]',
    popover: {
      title: '方式 3：附近公園',
      description:
        '點擊地圖下方「附近公園」按鈕 → 自動偵測半徑 500 公尺內公園（限台北市區）→ 選定公園 → 填寫表單資料送出 → 成功紀錄座標',
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '[data-tour="ai-search"]',
    popover: {
      title: '方式 4：詢問 AI',
      description:
        '在地圖左上方搜尋欄位 → 詢問 AI 推薦造訪的景點 → 待 AI 回覆座標 → 點擊地圖 → 填寫表單資料送出 → 成功紀錄座標',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="map"]',
    popover: {
      title: '地圖',
      description:
        '所有景點座標都會顯示在地圖上：<br/>1. 藍色：座標預設顏色<br/>2. 紅色：當前選取的座標<br/>3. 金色：在您收藏清單內的座標',
      side: 'left',
      align: 'center',
    },
  },
  {
    element: '[data-tour="place-card"]',
    popover: {
      title: '你儲存的地點',
      description:
        '左側的「景點清單」可瀏覽、編輯、刪除已新增的景點，或者將景點收藏在「收藏清單」，方便瀏覽精彩時刻。',
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '[data-tour="bookmark"]',
    popover: {
      title: '一鍵收藏',
      description: '點選書籤圖示，即可將景點收藏至「收藏清單」',
      side: 'right',
      align: 'start',
    },
  },
  {
    popover: {
      title: '導覽結束',
      description: '盡情探索吧！',
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
      nextBtnText: '下一步 →',
      prevBtnText: '← 上一步',
      doneBtnText: '完成',
      progressText: '{{current}} / {{total}}',
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
      使用說明
    </button>
  );
}
