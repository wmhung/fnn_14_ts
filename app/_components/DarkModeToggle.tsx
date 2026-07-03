'use client';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

function DarkModeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    setMounted(true);
  }, []);

  // Update class and localStorage when toggled
  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);

    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className='p-2 rounded-full bg-gray-200 hover:bg-accent-600 dark:bg-gray-700 dark:hover:bg-accent-600 hover:scale-125 transition-transform duration-300'
      aria-label='Toggle Dark Mode'
    >
      <span className='block w-5 h-5'>
        {mounted &&
          (isDark ? (
            <Sun className='w-5 h-5 text-yellow-400  hover:text-slate-50' />
          ) : (
            <Moon className='w-5 h-5 text-gray-800 hover:text-gray-50' />
          ))}
      </span>
    </button>
  );
}

export default DarkModeToggle;
