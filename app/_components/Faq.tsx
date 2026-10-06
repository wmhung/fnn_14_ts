'use client';

import { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';

const faqs = [
  {
    question: '什麼是 Finding Next Neverland？',
    answer:
      'Finding Next Neverland 是一款專為家長設計的網頁應用程式，用來記錄親子出遊的精彩時刻。幾張照片和文字，就能打造專屬您一家人的出遊地圖。',
  },
  {
    question: '我可以儲存哪些類型的地點？',
    answer:
      '公園和任何景點，只要是有效的地圖座標，都可以在地圖上標註並且儲存。',
  },
  {
    question: '如何儲存新地點？',
    answer:
      '登入後，在首頁點擊「開啟我的景點」，接下來有 4 種方式可以新增地點在左側的「景點清單」：\n　　1. 點擊地圖右上方的「定位符號」> GPS 定位成功 > 填寫表單資料送出 > 成功紀錄座標\n　　2. 在地圖找到要新增的景點 > 點擊地圖 > 填寫表單資料送出 > 成功紀錄座標\n　　3. 點擊地圖下方「附近公園」按鈕 > 自動偵測半徑 500 公尺內公園（限台北市區） > 選定公園 > 填寫表單資料送出 > 成功紀錄座標\n　　4. 在地圖左上方搜尋欄位 > 詢問 AI 推薦造訪的景點 > 待 AI 回覆座標 > 點擊地圖 > 填寫表單資料送出 > 成功紀錄座標',
  },
  {
    question: '收藏功能怎麼用？',
    answer:
      '1. 進入「景點清單」，選擇想要收藏的景點，點擊該景點的「書籤」標記，顯示顏色代表收藏成功。\n2. 接著點擊「收藏清單」，即可看到剛剛收藏的景點，點選該景點，將在地圖顯示座標。',
  },
  {
    question: '我可以在地圖上看到所有地點嗎？',
    answer:
      '您可以在地圖上看見平台所有會員建立的景點座標，點選座標可瀏覽景點評分、評論內容、建立的使用者。點選地圖左側「景點清單」中的景點，可進行編輯、更新、刪除內容以外，地圖將顯示您所點選座標的位置。',
  },
  {
    question: '如何註冊？',
    answer:
      '點選右上角的「登入／註冊」> 可使用電子郵件、Google 或 GitHub 建立會員帳號。',
  },
  {
    question: '我的資料是私密的嗎？',
    answer:
      '地圖上的座標會公開您對於該景點的評論、遊玩心得、帳號名稱，只有本平台的註冊會員看得到座標的公開資訊。您帳號內的景點清單、收藏清單、個人資料、帳號密碼等資料僅限您個人能更新和刪除。',
  },
  {
    question: '儲存後可以編輯或刪除地點嗎？',
    answer:
      '在左側「景點清單」點選任一地點：\n1. 點選「編輯」圖示可編輯已儲存的內容。\n2. 點選「刪除」圖示可將該景點刪除，刪除景點無法復原，因此系統會請您再次確認。',
  },
  {
    question: '可以在手機上使用嗎？',
    answer:
      '可以。應用程式為響應式介面設計，版面將依照您使用的裝置，自動調整為合適的尺寸，提供良好的使用者體驗。',
  },
  {
    question: '遇到問題——要去哪裡尋求協助？',
    answer:
      '來信至 brucewmhung@gmail.com，告訴我們您的問題。如果是系統異常，請附上截圖和文字說明，我們將盡快回覆您。',
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className='rounded-2xl bg-white dark:bg-slate-900 ring-1 ring-gray-200 dark:ring-slate-700 shadow-sm overflow-hidden divide-y divide-gray-100 dark:divide-slate-700'>
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={index}>
            <button
              type='button'
              onClick={() => toggleFAQ(index)}
              aria-expanded={isOpen}
              aria-controls={`faq-panel-${index}`}
              id={`faq-trigger-${index}`}
              className='w-full text-left flex justify-between items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/50 focus-visible:ring-inset transition'
            >
              <span className='text-base font-medium text-gray-900 dark:text-slate-100'>
                {faq.question}
              </span>
              <FaChevronDown
                aria-hidden='true'
                className={`shrink-0 w-4 h-4 text-gray-400 dark:text-slate-400 transition-transform duration-200 ease-out ${
                  isOpen ? 'rotate-180' : 'rotate-0'
                }`}
              />
            </button>

            {/* Smooth height transition via grid-template-rows (no max-h cap). */}
            <div
              id={`faq-panel-${index}`}
              role='region'
              aria-labelledby={`faq-trigger-${index}`}
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              }`}
            >
              <div className='overflow-hidden'>
                <p className='px-5 pb-5 text-sm text-gray-600 dark:text-slate-300 leading-relaxed whitespace-pre-line'>
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
