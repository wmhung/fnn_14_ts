'use client';

import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import BackButton from './BackButton';
import VisitsSection from './VisitsSection';

const formatDate = (date) =>
  date
    ? new Intl.DateTimeFormat('zh-TW', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        weekday: 'long',
      }).format(new Date(date))
    : '日期不明';

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

function Place({ place }) {
  const {
    id,
    dist,
    place_name: placeName,
    date,
    notes,
    star_rating: starRating,
    recreation,
    image,
    visit_count: visitCount,
  } = place;

  const calendarLink = createGoogleCalendarLink({
    title: `造訪 ${placeName}`,
    startDate: date,
    endDate: date,
    details: `一起去位於${dist}的${placeName}吧！${notes || ''}`,
    location: `${placeName}, ${dist}`,
  });

  return (
    <div className='flex flex-col w-full max-w-md h-[83vh] mx-4 px-[1px] pt-[1px] pb-2 rounded-lg shadow-xl dark:shadow-slate-400 dark:bg-slate-800'>
      {/* Image */}
      <div className='relative w-full min-h-[10rem]'>
        <Image
          className='rounded-tl-lg rounded-tr-lg object-cover'
          src={image || '/placeholder.jpg'}
          alt={`${placeName} 的照片`}
          fill
          quality={75}
          sizes='100vw'
          priority
        />
      </div>

      {/* Info Sections */}
      <div className='overflow-y-scroll overflow-x-hidden pb-6'>
        <InfoBlock title='行政區'>{dist || '不明'}</InfoBlock>
        <InfoBlock title='地點名稱'>{placeName || '未命名地點'}</InfoBlock>

        {/* Repeat-visit count + "Log a visit" (card modal) */}
        <VisitsSection
          placeId={id}
          placeName={placeName || '這個地點'}
          dist={dist}
          initialCount={visitCount ?? 0}
        />

        <InfoBlock title={`我們第一次造訪${placeName}是什麼時候？`}>
          {formatDate(date)}
        </InfoBlock>
        <InfoBlock title='評分'>
          {[...Array(Number(starRating || 0))].map((_, i) => (
            <span key={i}>⭐️</span>
          ))}
        </InfoBlock>
        <InfoBlock title='我們玩得開心嗎？'>
          {notes || '沒有筆記紀錄。'}
        </InfoBlock>
        <InfoBlock title='休閒設施'>
          {recreation || '未指定。'}
        </InfoBlock>
        <InfoBlock title='了解更多'>
          <Link
            href={`https://zh.wikipedia.org/zh-tw/${placeName}`}
            target='_blank'
            rel='noopener noreferrer'
            className='text-blue-600 dark:text-accent-600 hover:underline'
          >
            在維基百科查看 {placeName}
          </Link>
        </InfoBlock>

        {/* Add to Google Calendar */}
        <InfoBlock title='加入行事曆'>
          <Link
            href={calendarLink}
            target='_blank'
            rel='noopener noreferrer'
            className='text-blue-600 dark:text-accent-600 hover:underline'
          >
            將這次造訪加入 Google 日曆
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

export default Place;
