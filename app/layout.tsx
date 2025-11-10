import '@/app/_styles/globals.css';
import { Raleway, Press_Start_2P, Tektur, Exo_2 } from 'next/font/google';
import { ParkProvider } from './_lib/contexts/ParkContext';
import { BookmarkProvider } from './_lib/contexts/BookmarkContext';
import { UserRoleProvider } from './_lib/contexts/UserRoleContext';
import { Providers } from './_lib/providers';
import Header from './_components/Header';

// const pixelfont = Tektur({
//   subsets: ['latin'],
//   display: 'swap',
//   weight: '600',
// });
const raleway = Raleway({ subsets: ['latin'] });

export const metadata = {
  // page title, `%s` can show the current page title of meta data
  title: {
    template: '%s | Finding Next Neverland',
    default: 'Welcome | Finding Next Neverland',
  },
  // website description for seo
  description: 'Explore parks and places, and have fun with your kids.',
};

export default function RootLayout({ children }) {
  return (
    <html lang='en' className='mx-0'>
      <head>
        {/* Inject dark mode preference script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  const theme = localStorage.getItem('theme');
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (theme === 'dark' || (!theme && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (_) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${raleway.className} font-semibold antialiased bg-slate-50 text-slate-800 dark:bg-slate-800 dark:text-slate-50 min-h-screen flex flex-col relative overflow-y-scroll`}
      >
        <Providers>
          <Header />
          <div className='flex-none 2xs:flex-2 xs:flex-1 mx-0 my-0 grid z-0'>
            <main className='max-w-7xl w-full mx-auto my-auto'>
              <UserRoleProvider>
                <ParkProvider>
                  <BookmarkProvider>{children}</BookmarkProvider>
                </ParkProvider>
              </UserRoleProvider>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
