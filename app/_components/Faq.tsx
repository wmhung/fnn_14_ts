'use client';

import { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';

const faqs = [
  {
    question: 'What is Finding Next Neverland?',
    answer:
      'Finding Next Neverland (FNN) is a personal place-tracker for parents. Save the parks, playgrounds, museums, and schools you visit with your kids, add photos and notes, and build a private map of memorable family outings.',
  },
  {
    question: 'What kinds of places can I save?',
    answer:
      'Four categories so far: parks, playgrounds, museums, and schools. When you add a place, you pick its type so you can later filter or color-code the map.',
  },
  {
    question: 'How do I save a new place?',
    answer:
      'Sign in, open your Places list from the menu, and click "Add a place". Fill in the name, type, location, photo, and any notes — then save. The new spot appears on your map and in your list right away.',
  },
  {
    question: 'How do bookmarks work?',
    answer:
      'Tap the heart on any place to bookmark it. Bookmarks live in their own tab, so the spots you love most are always one tap away.',
  },
  {
    question: 'Can I see all my places on a map?',
    answer:
      "Yes. The map view shows every place you've saved as a marker. Tap a marker to see its photo and notes, or tap a row in the list to focus the map on that location.",
  },
  {
    question: 'How do I sign up?',
    answer:
      'Click "Login / Sign up" in the top-right and choose Google, GitHub, or email + password. Whichever you pick, your places are linked to that account.',
  },
  {
    question: 'Is my data private?',
    answer:
      "Yes. Only you see your places and bookmarks — they're scoped to your account using Supabase row-level security. We never share or sell user data.",
  },
  {
    question: 'Can I edit or delete a place after saving?',
    answer:
      'Open any place from your list, then tap Edit to update its details or Delete to remove it. Deletes are permanent, so the app asks you to confirm first.',
  },
  {
    question: 'Does this work on my phone?',
    answer:
      'Yes — the layout adapts to phones, tablets, and laptops. On mobile you can swipe between the list and the map for a one-handed view.',
  },
  {
    question: "Something's broken — where do I get help?",
    answer:
      'Email brucewmhung@gmail.com with a short description of what you were trying to do and what went wrong. A screenshot helps a lot. I usually reply within a day or two.',
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
                <p className='px-5 pb-5 text-sm text-gray-600 dark:text-slate-300 leading-relaxed'>
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
