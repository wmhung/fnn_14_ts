import Faq from '@/app/_components/Faq';
import Link from 'next/link';
import { MdEmail } from 'react-icons/md';
import { FaBug, FaCheckCircle } from 'react-icons/fa';
import { HiOutlineLightBulb } from 'react-icons/hi';

export const metadata = {
  title: 'Support · Finding Next Neverland',
  description:
    'Get help with Finding Next Neverland — contact support, report a bug, or browse the FAQ.',
};

type ContactCard = {
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  /** Tailwind classes for the icon's circular background. */
  iconWrap: string;
  /** Tailwind classes for the icon itself. */
  iconColor: string;
};

const contactCards: ContactCard[] = [
  {
    href: 'mailto:brucewmhung@gmail.com?subject=FNN%20—%20Support%20request',
    Icon: MdEmail,
    title: 'Email support',
    description:
      'For account issues, login problems, or anything sensitive. Reply within a day or two.',
    iconWrap: 'bg-sky-50 dark:bg-sky-900/30 ring-sky-200 dark:ring-sky-700',
    iconColor: 'text-sky-500 dark:text-sky-400',
  },
  {
    href: 'mailto:brucewmhung@gmail.com?subject=FNN%20—%20Bug%20report',
    Icon: FaBug,
    title: 'Report a bug',
    description:
      'Tell me what you tried, what you expected, and what happened. A screenshot helps a lot.',
    iconWrap: 'bg-rose-50 dark:bg-rose-900/30 ring-rose-200 dark:ring-rose-700',
    iconColor: 'text-rose-500 dark:text-rose-400',
  },
  {
    href: 'mailto:brucewmhung@gmail.com?subject=FNN%20—%20Feature%20idea',
    Icon: HiOutlineLightBulb,
    title: 'Suggest a feature',
    description:
      'Something missing? A new place type? Tell me what would make FNN more useful for your family.',
    iconWrap:
      'bg-amber-50 dark:bg-amber-900/30 ring-amber-200 dark:ring-amber-700',
    iconColor: 'text-amber-500 dark:text-amber-400',
  },
];

const quickFixes = [
  'Sign out and sign back in — clears stale sessions.',
  'Refresh with cache disabled (Cmd/Ctrl + Shift + R) — fixes most rendering glitches.',
];

export default function Page() {
  return (
    <div className='w-full'>
      {/* PAGE HEADER */}
      <header className='sticky top-0 z-30 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-gray-200 dark:border-slate-700'>
        <div className='max-w-3xl mx-auto px-4 sm:px-6 py-5 text-center'>
          <span className='inline-block text-xs font-semibold text-accent-600 dark:text-accent-400 uppercase tracking-wider'>
            Support
          </span>
          <h1 className='mt-1 text-2xl md:text-3xl font-semibold text-gray-900 dark:text-slate-100 leading-tight'>
            How can we help?
          </h1>
        </div>
      </header>

      {/* CONTENT */}
      <div className='max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-12'>
        {/* Contact cards */}
        <section>
          <h2 className='text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3'>
            Get in touch
          </h2>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
            {contactCards.map(
              ({ href, Icon, title, description, iconWrap, iconColor }) => (
                <a
                  key={title}
                  href={href}
                  className='group flex flex-col bg-white dark:bg-slate-900 rounded-2xl ring-1 ring-gray-200 dark:ring-slate-700 shadow-sm p-5 hover:-translate-y-0.5 hover:shadow-md hover:ring-gray-300 dark:hover:ring-slate-600 transition-all'
                >
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full ring-1 ring-inset ${iconWrap} mb-3`}
                  >
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                  </div>
                  <h3 className='font-semibold text-base text-gray-900 dark:text-slate-100 mb-1'>
                    {title}
                  </h3>
                  <p className='text-sm text-gray-600 dark:text-slate-300 leading-relaxed'>
                    {description}
                  </p>
                </a>
              ),
            )}
          </div>
        </section>

        {/* Quick fixes */}
        <section>
          <h2 className='text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3'>
            Quick fixes
          </h2>
          <div className='bg-white dark:bg-slate-900 rounded-2xl ring-1 ring-gray-200 dark:ring-slate-700 shadow-sm p-5 sm:p-6'>
            <p className='text-sm text-gray-600 dark:text-slate-300 leading-relaxed mb-4'>
              Most issues clear up in under a minute. Try these first:
            </p>
            <ul className='space-y-3'>
              {quickFixes.map((fix) => (
                <li
                  key={fix}
                  className='flex items-start gap-2.5 text-sm text-gray-700 dark:text-slate-200'
                >
                  <FaCheckCircle className='shrink-0 mt-0.5 w-4 h-4 text-emerald-500 dark:text-emerald-400' />
                  <span>{fix}</span>
                </li>
              ))}
              <li className='flex items-start gap-2.5 text-sm text-gray-700 dark:text-slate-200'>
                <FaCheckCircle className='shrink-0 mt-0.5 w-4 h-4 text-emerald-500 dark:text-emerald-400' />
                <span>
                  Check{' '}
                  <Link
                    href='/placelist'
                    className='text-accent-600 hover:underline dark:text-accent-400 font-medium'
                  >
                    your places list
                  </Link>{' '}
                  — your data is account-scoped, so make sure you&apos;re signed
                  into the right account.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className='text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3'>
            Frequently asked questions
          </h2>
          <Faq />
        </section>
      </div>
    </div>
  );
}
