'use client';

import { useState } from 'react';
import { RxCross2 } from 'react-icons/rx';
import { IoAdd } from 'react-icons/io5';

const faqs = [
  {
    question: 'What is this website about?',
    answer:
      'This website helps users discover parks and bookmark their favorites.',
  },
  {
    question: 'How can I sign up?',
    answer:
      'Click the "Login / Sign up" button in the top-right and choose your preferred method.',
  },
  {
    question: 'Can I use my Google account?',
    answer:
      'Yes! We support Google and GitHub logins, along with custom credentials.',
  },
  {
    question: 'How can I sign up?',
    answer:
      'Click the "Login / Sign up" button in the top-right and choose your preferred method.',
  },
  {
    question: 'Can I use my Google account?',
    answer:
      'Yes! We support Google and GitHub logins, along with custom credentials.',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className='max-w-2xl mx-auto px-4 py-12'>
      <h1 className='text-4xl text-slate-700 font-bold mb-8 text-center sticky top-0 z-10 py-4'>
        Frequently Asked Questions
      </h1>
      <div className='space-y-4'>
        {faqs.map((faq, index) => (
          <div
            key={index}
            className='border border-slate-300 rounded-sm shadow-md p-4 transition-all duration-300'
          >
            <button
              className='w-full text-left flex justify-between items-center'
              onClick={() => toggleFAQ(index)}
            >
              <span className='text-lg text-slate-700 font-bold'>
                {faq.question}
              </span>
              <span className='text-2xl'>
                {openIndex === index ? <RxCross2 /> : <IoAdd />}
              </span>
            </button>
            <div
              className={`mt-2 text-slate-500 transition-all duration-300 ${
                openIndex === index
                  ? 'max-h-40 opacity-100'
                  : 'max-h-0 opacity-0 overflow-hidden'
              }`}
            >
              {faq.answer}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
