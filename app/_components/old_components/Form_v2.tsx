'use client';

import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { useUrlPosition } from '@/app/_lib/hooks/useUrlPosition';
import { useParks } from '@/app/_lib/contexts/ParkContext';
import { useRouter } from 'next/navigation';
import { getUserParkCount, createFeedback } from '@/app/_lib/data-service';

import DatePicker from 'react-datepicker';
import Button from '../Button';
import BackButton from '../BackButton';
import Message from '../Message';
import Spinner from '../Spinner';
import StarRating from '../StarRating';
import FeedbackModal from '../FeedbackModal';
import 'react-datepicker/dist/react-datepicker.css';

const BASE_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

// ---------- Type Definitions ----------
interface User {
  id: string;
  email: string;
  fullName?: string;
}

interface FormProps {
  user: User;
  userName?: string;
}

interface FeedbackData {
  rating: number;
  review: string;
}

interface ParkPosition {
  lat: number;
  lng: number;
}

interface ParkInput {
  dist: string;
  city: string;
  parkName: string;
  date: string; // store as ISO string for Supabase
  notes: string;
  recreation: string;
  position: ParkPosition;
  image: File | null;
  starRating: number;
  email: string;
  userName: string;
}

export default function Form({ user, userName }: FormProps) {
  const [lat, lng] = useUrlPosition();
  const { createPark, isLoading } = useParks();
  const router = useRouter();

  const displayName = user.fullName || userName || 'Anonymous';

  // ---------- State ----------
  const [isLoadingGeocoding, setIsLoadingGeocoding] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const [dist, setDist] = useState('');
  const [parkName, setParkName] = useState('');
  const [city, setCity] = useState('');
  const [date, setDate] = useState<Date | null>(new Date());
  const [notes, setNotes] = useState('');
  const [recreation, setRecreation] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [starRating, setStarRating] = useState(0);
  const [geocodingError, setGeocodingError] = useState('');

  // ---------- Handlers ----------
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImage(file);
  };

  useEffect(() => {
    if (!lat || !lng) return;

    async function fetchCityData() {
      try {
        setIsLoadingGeocoding(true);
        const res = await fetch(`${BASE_URL}?latitude=${lat}&longitude=${lng}`);
        const data = await res.json();

        if (!data.countryCode) {
          throw new Error(
            "That doesn't seem to be a city. Click somewhere else."
          );
        }

        setDist(data.locality || '');
        setCity(data.city);
      } catch (err: any) {
        setGeocodingError(err.message);
      } finally {
        setIsLoadingGeocoding(false);
      }
    }

    fetchCityData();
  }, [lat, lng]);

  // ---------- Feedback ----------
  async function handleFeedbackSubmit({ rating, review }: FeedbackData) {
    try {
      await createFeedback({
        userId: user.id,
        appRating: rating,
        review,
      });
    } catch (err: any) {
      console.error('Failed to submit feedback:', err.message);
    } finally {
      setShowFeedbackModal(false);
      router.push('/parklist');
      router.refresh();
    }
  }

  // ---------- Form Submission ----------
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!parkName || !date) return;

    let countBefore = 0;
    try {
      countBefore = await getUserParkCount(user.email);
      console.log('Park count before insert:', countBefore);
    } catch (error: any) {
      console.error('Error in getUserParkCount:', error.message);
    }

    const newPark: ParkInput = {
      dist,
      city,
      parkName,
      date: date.toISOString(), // ✅ Convert to string
      notes,
      recreation,
      position: { lat, lng },
      image,
      starRating,
      email: user.email,
      userName: displayName,
    };

    await createPark(newPark);

    if (countBefore === 0) {
      setShowFeedbackModal(true);
    } else {
      router.push('/parklist');
      router.refresh();
    }
  }

  // ---------- Conditional UI ----------
  if (isLoadingGeocoding) return <Spinner />;
  if (!lat && !lng)
    return <Message message='Start by clicking somewhere on the map' />;
  if (geocodingError) return <Message message={geocodingError} />;

  // ---------- Render ----------
  return (
    <>
      <form
        className='flex flex-col w-[30rem] h-[83vh] mx-3 px-2 py-3 overflow-y-scroll overflow-x-hidden gap-[2px] list-none border rounded-lg inset-shadow'
        onSubmit={submit}
      >
        {/* City */}
        <div className='flex flex-col w-[18rem] mx-auto my-auto p-1'>
          <label className='uppercase font-extrabold m-1' htmlFor='city'>
            City name
          </label>
          <input
            className='bg-slate-200 border border-slate-300 p-1 rounded-sm dark:text-slate-800 outline-accent-600'
            id='city'
            onChange={(e) => setCity(e.target.value)}
            value={city}
          />
        </div>

        {/* District */}
        <div className='flex flex-col w-[18rem] mx-auto my-auto p-1'>
          <label className='uppercase font-extrabold m-1' htmlFor='dist'>
            District name
          </label>
          <input
            className='bg-slate-200 border border-slate-300 p-1 rounded-sm dark:text-slate-800 outline-accent-600'
            id='dist'
            onChange={(e) => setDist(e.target.value)}
            value={dist}
          />
        </div>

        {/* Park Name */}
        <div className='flex flex-col w-[18rem] mx-auto my-auto p-1'>
          <label className='uppercase font-extrabold my-1' htmlFor='parkName'>
            Park name
          </label>
          <input
            className='bg-slate-200 border border-slate-300 p-1 rounded-sm dark:text-slate-800 outline-accent-600'
            id='parkName'
            onChange={(e) => setParkName(e.target.value)}
            value={parkName}
            required
          />
        </div>

        {/* Date */}
        <div className='flex flex-col w-[18rem] mx-auto my-auto p-1'>
          <label className='uppercase font-extrabold my-1' htmlFor='date'>
            When did you go to {parkName} ?
          </label>
          <DatePicker
            className='bg-slate-200 border border-slate-300 p-1 rounded-sm dark:text-slate-800 outline-accent-600'
            id='date'
            selected={date}
            onChange={(d: Date | null) => d && setDate(d)}
            dateFormat='dd/MM/yyyy'
          />
        </div>

        {/* Rating */}
        <div className='flex flex-col w-[18rem] mx-auto my-auto p-1'>
          <label className='uppercase font-extrabold my-1' htmlFor='starRating'>
            Ratings
          </label>
          <StarRating
            className='dark:text-slate-50'
            maxRating={5}
            size={35}
            onSetRating={setStarRating}
            required
          />
        </div>

        {/* Notes */}
        <div className='flex flex-col w-[18rem] mx-auto my-auto p-1'>
          <label className='uppercase font-extrabold my-1' htmlFor='notes'>
            Did we have fun at {parkName} ?
          </label>
          <textarea
            className='bg-slate-200 border border-slate-300 p-1 rounded-sm dark:text-slate-800 outline-accent-600'
            id='notes'
            onChange={(e) => setNotes(e.target.value)}
            value={notes}
            required
          />
        </div>

        {/* Recreation */}
        <div className='flex flex-col w-[18rem] mx-auto my-auto p-1'>
          <label className='uppercase font-extrabold my-1' htmlFor='recreation'>
            Recreation Facilities in {parkName}
          </label>
          <textarea
            className='bg-slate-200 border border-slate-300 p-1 rounded-sm dark:text-slate-800 outline-accent-600'
            id='recreation'
            onChange={(e) => setRecreation(e.target.value)}
            value={recreation}
            required
          />
        </div>

        {/* Upload */}
        <div className='flex flex-col w-[18rem] mx-auto my-auto p-1'>
          <label className='uppercase font-extrabold my-1' htmlFor='image'>
            Upload photos
          </label>
          <input
            className='bg-slate-200 border border-slate-300 p-1 rounded-sm dark:text-slate-800 outline-accent-600'
            id='image'
            type='file'
            onChange={handleFileChange}
            disabled={isLoading}
          />
          {isLoading && <p>Uploading...</p>}
        </div>

        {/* Buttons */}
        <div className='flex justify-between p-6 text-sm'>
          <Button className='text-slate-50' disabled={isLoading}>
            {isLoading ? 'Creating' : 'Add'}
          </Button>
          <BackButton />
        </div>
      </form>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <FeedbackModal
          onClose={() => {
            setShowFeedbackModal(false);
            router.push('/parklist');
            router.refresh();
          }}
          onSubmit={handleFeedbackSubmit}
        />
      )}
    </>
  );
}
