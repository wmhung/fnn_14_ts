import '@/app/_styles/globals.css';
import { Raleway, Press_Start_2P, Tektur, Exo_2 } from 'next/font/google';
import AppProviders from './_lib/AppProviders';
import Providers from './_lib/providers';
import { auth } from './_lib/auth';
import Header from './_components/Header';
import ThemeScript from './_components/ThemeScript';

const raleway = Raleway({ subsets: ['latin'] });

export const metadata = {
  // page title, `%s` can show the current page title of meta data
  title: {
    template: '%s | Finding Next Neverland',
    default: '歡迎 | Finding Next Neverland',
  },
  // website description for seo
  description: '探索新地點，和孩子一起玩得開心。',
};

export default async function RootLayout({ children }) {
  const session = await auth();
  return (
    <html lang='zh-Hant' className='mx-0' suppressHydrationWarning>
      <head>
        {/* Inject dark mode preference script */}
        <ThemeScript />
      </head>
      <body
        className={`${raleway.className} font-semibold antialiased bg-slate-50 text-slate-800 dark:bg-slate-800 dark:text-slate-50 min-h-screen flex flex-col relative overflow-y-scroll`}
      >
        <Providers session={session}>
          <Header />
          <div className='flex-none 2xs:flex-1 xs:flex-1 mx-0 my-0 grid z-0'>
            <main className='max-w-7xl w-full mx-auto my-auto'>
              <AppProviders>{children}</AppProviders>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
