'use client';

export default function SlidingPanel({ isVisible, children }) {
  return (
    <div
      className={`fixed top-0 left-0 h-full w-4/5 max-w-sm bg-white z-30 transition-transform duration-300 ease-in-out 
        ${isVisible ? 'translate-x-0' : '-translate-x-full'}`}
    >
      {children}
    </div>
  );
}
