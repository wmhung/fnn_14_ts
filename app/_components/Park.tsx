'use client';

import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import BackButton from './BackButton';

const formatDate = (date) =>
  date
    ? new Intl.DateTimeFormat('en', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        weekday: 'long',
      }).format(new Date(date))
    : 'Unknown date';

const formatDateToGoogle = (dateStr) => {
  // Formats date to UTC format: YYYYMMDDTHHmmssZ
  const date = new Date(dateStr);
  return format(date, "yyyyMMdd'T'HHmmss'Z'");
};

const createGoogleCalendarLink = ({
  title,
  startDate,
  endDate,
  details,
  location,
}) => {
  const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';

  const params = new URLSearchParams({
    text: title,
    dates: `${formatDateToGoogle(startDate)}/${formatDateToGoogle(endDate)}`,
    details,
    location,
  });

  return `${baseUrl}&${params.toString()}`;
};

const InfoBlock = ({ title, children }) => (
  <div className='flex flex-col min-w-[10rem] mx-5 my-2  uppercase'>
    <h2 className='my-1 text-slate-400 text-sm dark:text-slate-500'>{title}</h2>
    <p className='text-slate-800 font-extrabold  dark:text-slate-50'>
      {children}
    </p>
    <div className='border-b-2 border-dotted border-slate-200 dark:border-slate-500' />
  </div>
);

function Park({ park }) {
  const { dist, parkName, date, notes, starRating, recreation, image } = park;

  const calendarLink = createGoogleCalendarLink({
    title: `Visit ${parkName}`,
    startDate: date,
    endDate: date,
    details: `Let's visit ${parkName} located in ${dist}. ${notes || ''}`,
    location: `${parkName}, ${dist}`,
  });

  return (
    <div className='flex flex-col w-full max-w-md h-[83vh] mx-4 px-[1px] pt-[1px] pb-2 rounded-lg shadow-xl dark:shadow-slate-400 dark:bg-slate-800'>
      {/* Image */}
      <div className='relative w-full min-h-[10rem]'>
        <Image
          className='rounded-tl-lg rounded-tr-lg object-cover'
          src={image || '/placeholder.jpg'}
          alt={`Photo of ${parkName}`}
          fill
          quality={75}
          sizes='100vw'
          priority
        />
      </div>

      {/* Info Sections */}
      <div className='overflow-y-scroll overflow-x-hidden pb-6'>
        <InfoBlock title='District Name'>{dist || 'Unknown'}</InfoBlock>
        <InfoBlock title='Park Name'>{parkName || 'Unnamed Park'}</InfoBlock>
        <InfoBlock title={`When did we visit ${parkName}?`}>
          {formatDate(date)}
        </InfoBlock>
        <InfoBlock title='Ratings'>
          {[...Array(Number(starRating || 0))].map((_, i) => (
            <span key={i}>⭐️</span>
          ))}
        </InfoBlock>
        <InfoBlock title='Did we have fun?'>
          {notes || 'No notes recorded.'}
        </InfoBlock>
        <InfoBlock title='Recreation facilities'>
          {recreation || 'Not specified.'}
        </InfoBlock>
        <InfoBlock title='Learn more'>
          <Link
            href={`https://zh.wikipedia.org/zh-tw/${parkName}`}
            target='_blank'
            rel='noopener noreferrer'
            className='text-blue-600 dark:text-accent-600 hover:underline'
          >
            Check out {parkName} on Wikipedia
          </Link>
        </InfoBlock>

        {/* Add to Google Calendar */}
        <InfoBlock title='Add to Calendar'>
          <Link
            href={calendarLink}
            target='_blank'
            rel='noopener noreferrer'
            className='text-blue-600 dark:text-accent-600 hover:underline'
          >
            Add this visit to your Google Calendar
          </Link>
        </InfoBlock>

        {/* Back Button */}
        <div className='flex justify-start mt-4 mx-5 py-2 text-sm'>
          <BackButton />
        </div>
      </div>
    </div>
  );
}

export default Park;
