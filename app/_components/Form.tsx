'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useUrlPosition } from '@/app/_lib/hooks/useUrlPosition';
import { useParks } from '../_lib/contexts/ParkContext';
import { useRouter } from 'next/navigation';
import { getUserParkCount, createFeedback } from '@/app/_lib/data-service';
import type { Park } from '../_lib/contexts/ParkContext';

import DatePicker from 'react-datepicker';
import Button from './Button';
import BackButton from './BackButton';
import Message from './Message';
import Spinner from './Spinner';
import StarRating from './StarRating';
import FeedbackModal from './FeedbackModal';
import 'react-datepicker/dist/react-datepicker.css';

export type ParkInput = Omit<Park, 'id' | 'image'> & { image: File | string };

export interface FormUser {
  id?: string;
  email: string;
  full_name?: string;
}

interface FormProps {
  user: FormUser;
  user_name?: string;
}

interface FeedbackData {
  rating: number;
  review: string;
}

const BASE_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

export default function Form({ user, user_name }: FormProps) {
  const [lat, lng] = useUrlPosition();
  const { createPark, isLoading } = useParks();
  const router = useRouter();
  const { email, full_name } = user;

  const displayName = full_name || user_name || 'Anonymous';

  const [isLoadingGeocoding, setIsLoadingGeocoding] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [success, setSuccess] = useState(false);

  const [dist, setDist] = useState('');
  const [parkName, setParkName] = useState('');
  const [city, setCity] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState('');
  const [recreation, setRecreation] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [starRating, setStarRating] = useState(0);
  const [geocodingError, setGeocodingError] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImage(e.target.files[0]);
    }
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
            "That doesn't seem to be a city. Click somewhere else.",
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

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!parkName || !date || !image) {
      setErrorMsg('Please fill all required fields');
      return;
    }

    setErrorMsg('');

    let countBefore = 0;
    try {
      countBefore = await getUserParkCount(email);
    } catch (error: any) {
      console.error('Error in getUserParkCount:', error.message);
    }

    const newPark: ParkInput = {
      dist,
      city,
      park_name: parkName,
      date: date.toISOString(),
      notes,
      recreation,
      position: { lat, lng },
      image,
      star_rating: starRating,
      email,
      user_name: displayName,
    };

    try {
      await createPark(newPark);
      setSuccess(true);
    } catch (err: any) {
      console.error('Create park failed:', err.message);
      setErrorMsg('Failed to add park. Please try again.');
      return;
    }

    if (countBefore === 0) {
      setShowFeedbackModal(true);
    } else {
      setTimeout(() => {
        router.push('/parklist');
        router.refresh();
      }, 1200);
    }
  }

  if (isLoadingGeocoding) return <Spinner />;
  if (!lat && !lng)
    return <Message message='Start by clicking somewhere on the map' />;
  if (geocodingError) return <Message message={geocodingError} />;

  if (success) {
    return <Message message='✅ Park added successfully!' />;
  }

  return (
    <>
      <form
        className='flex flex-col w-[30rem] h-[83vh] mx-3 px-2 py-3 overflow-y-scroll overflow-x-hidden gap-[2px] list-none border rounded-lg inset-shadow'
        onSubmit={submit}
      >
        {errorMsg && (
          <p className='text-red-500 text-center font-semibold'>{errorMsg}</p>
        )}

        <div className='flex flex-col w-[18rem] mx-auto my-auto p-1'>
          <label className='uppercase font-extrabold m-1'>City name</label>
          <input
            className='bg-slate-200 border p-1 rounded-sm dark:text-slate-800'
            onChange={(e) => setCity(e.target.value)}
            value={city}
          />
        </div>

        <div className='flex flex-col w-[18rem] mx-auto my-auto p-1'>
          <label className='uppercase font-extrabold m-1'>District name</label>
          <input
            className='bg-slate-200 border p-1 rounded-sm dark:text-slate-800'
            onChange={(e) => setDist(e.target.value)}
            value={dist}
          />
        </div>

        <div className='flex flex-col w-[18rem] mx-auto my-auto p-1'>
          <label className='uppercase font-extrabold my-1'>Park name</label>
          <input
            className='bg-slate-200 border p-1 rounded-sm dark:text-slate-800'
            onChange={(e) => setParkName(e.target.value)}
            value={parkName}
            required
          />
        </div>

        <div className='flex flex-col w-[18rem] mx-auto my-auto p-1'>
          <label className='uppercase font-extrabold my-1'>Date</label>
          <DatePicker
            className='bg-slate-200 border p-1 rounded-sm dark:text-slate-800'
            onChange={(date: Date | null) => setDate(date ?? new Date())}
            selected={date}
            dateFormat='dd/MM/yyyy'
          />
        </div>

        <div className='flex flex-col w-[18rem] mx-auto my-auto p-1'>
          <label className='uppercase font-extrabold my-1'>Ratings</label>
          <StarRating maxRating={5} size={35} onSetRating={setStarRating} />
        </div>

        <div className='flex flex-col w-[18rem] mx-auto my-auto p-1'>
          <label className='uppercase font-extrabold my-1'>Notes</label>
          <textarea
            className='bg-slate-200 border p-1 rounded-sm dark:text-slate-800'
            onChange={(e) => setNotes(e.target.value)}
            value={notes}
            required
          />
        </div>

        <div className='flex flex-col w-[18rem] mx-auto my-auto p-1'>
          <label className='uppercase font-extrabold my-1'>Recreation</label>
          <textarea
            className='bg-slate-200 border p-1 rounded-sm dark:text-slate-800'
            onChange={(e) => setRecreation(e.target.value)}
            value={recreation}
            required
          />
        </div>

        <div className='flex flex-col w-[18rem] mx-auto my-auto p-1'>
          <label className='uppercase font-extrabold my-1'>Upload photos</label>
          <input type='file' onChange={handleFileChange} disabled={isLoading} />
          {isLoading && <p>Uploading...</p>}
        </div>

        <div className='flex justify-between p-6 text-sm text-slate-200'>
          <Button disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Add'}
          </Button>
          <BackButton />
        </div>
      </form>

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
