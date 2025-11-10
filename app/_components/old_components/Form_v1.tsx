'use client';

import { useEffect, useState } from 'react';
import { useUrlPosition } from '@/app/_lib/hooks/useUrlPosition';
import { useParks } from '@/app/_lib/contexts/ParkContext';
import { useRouter } from 'next/navigation';
import { getUserParkCount } from '@/app/_lib/data-service';
import { createFeedback } from '@/app/_lib/data-service';

import DatePicker from 'react-datepicker';
import Button from '../Button';
import BackButton from '../BackButton';
import Message from '../Message';
import Spinner from '../Spinner';
import StarRating from '../StarRating';
import FeedbackModal from '../FeedbackModal';
import 'react-datepicker/dist/react-datepicker.css';

const BASE_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

function Form({ user, userName }) {
  const [lat, lng] = useUrlPosition();
  const { createPark, isLoading } = useParks();
  const router = useRouter();
  const { email, fullName } = user;

  const displayName = fullName || userName || 'Anonymous';

  const [isLoadingGeocoding, setIsLoadingGeocoding] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const [dist, setDist] = useState('');
  const [parkName, setParkName] = useState('');
  const [city, setCity] = useState('');
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [recreation, setRecreation] = useState('');
  const [image, setImage] = useState(null);
  const [starRating, setStarRating] = useState(0);
  const [geocodingError, setGeocodingError] = useState('');

  const handleFileChange = (e) => {
    setImage(e.target.files[0]); // Store the file object in state
  };

  useEffect(
    function () {
      if (!lat && !lng) return;

      async function fetchCityData() {
        try {
          setIsLoadingGeocoding(true);
          const res = await fetch(
            `${BASE_URL}?latitude=${lat}&longitude=${lng}`
          );
          const data = await res.json();
          // console.log(data);

          if (!data.countryCode)
            throw new Error(
              "That doesn't seem to be a city. Click somewhere else."
            );

          // fill city or locality name automatically when pin on map
          setDist(data.locality || '');
          setCity(data.city);
        } catch (err) {
          setGeocodingError(err.message);
        } finally {
          setIsLoadingGeocoding(false);
        }
      }
      fetchCityData();
    },
    [lat, lng]
  );

  // Submit feedback to Supabase or other backend
  async function handleFeedbackSubmit({ rating, review }) {
    try {
      await createFeedback({
        userId: user.id,
        appRating: rating,
        review,
      });
    } catch (err) {
      console.error('Failed to submit feedback:', err.message);
    } finally {
      setShowFeedbackModal(false);
      router.push('/parklist');
      router.refresh();
    }
  }

  async function submit(e) {
    e.preventDefault();
    if (!parkName || !date) return;

    let countBefore = 0;

    try {
      countBefore = await getUserParkCount(email);
      console.log('Park count before insert:', countBefore);
    } catch (error) {
      console.error('Error in getUserParkCount:', error.message);
    }

    const newPark = {
      dist,
      city,
      parkName,
      date,
      notes,
      recreation,
      position: { lat, lng },
      image,
      starRating,
      email: email,
      userName: displayName,
    };

    await createPark(newPark);

    if (countBefore === 0) {
      setShowFeedbackModal(true); // Show modal for first park
    } else {
      router.push('/parklist');
      router.refresh();
    }
  }

  if (isLoadingGeocoding) return <Spinner />;

  if (!lat && !lng)
    return <Message message='Start by clicking somewhere on the map' />;

  if (geocodingError) return <Message message={geocodingError} />;

  return (
    <>
      <form
        className='flex flex-col w-[30rem] h-[83vh] mx-3 px-2 py-3 overflow-y-scroll overflow-x-hidden gap-[2px] list-none border rounded-lg inset-shadow'
        onSubmit={submit}
      >
        <div className='flex flex-col w-[18rem] mx-auto my-auto p-1'>
          <label className='uppercase font-extrabold m-1' htmlFor='city'>
            City name
          </label>
          <input
            className='bg-slate-200 border-[1px] border-slate-300 p-1 rounded-sm dark:text-slate-800 outline-accent-600'
            id='city'
            onChange={(e) => setCity(e.target.value)}
            value={city}
          />
        </div>

        <div className='flex flex-col w-[18rem] mx-auto my-auto p-1'>
          <label className='uppercase font-extrabold m-1' htmlFor='dist'>
            District name
          </label>
          <input
            className='bg-slate-200 border-[1px] border-slate-300 p-1 rounded-sm dark:text-slate-800 outline-accent-600'
            id='dist'
            onChange={(e) => setDist(e.target.value)}
            value={dist}
          />
        </div>

        <div className='flex flex-col w-[18rem] mx-auto my-auto p-1'>
          <label className='uppercase font-extrabold my-1' htmlFor='parkName'>
            Park name
          </label>
          <input
            className='bg-slate-200 border-[1px] border-slate-300 p-1 rounded-sm dark:text-slate-800 outline-accent-600'
            id='parkName'
            onChange={(e) => setParkName(e.target.value)}
            value={parkName}
            required
          />
        </div>

        <div className='flex flex-col w-[18rem] mx-auto my-auto p-1'>
          <label className='uppercase font-extrabold my-1' htmlFor='date'>
            When did you go to {parkName} ?
          </label>

          <DatePicker
            className='bg-slate-200 border-[1px] border-slate-300 p-1 rounded-sm dark:text-slate-800 outline-accent-600'
            id='date'
            onChange={(date) => setDate(date)}
            selected={date}
            dateFormat='dd/MM/yyyy'
          />
        </div>

        <div className='flex flex-col w-[18rem] mx-auto my-auto p-1'>
          <label className='uppercase font-extrabold my-1' htmlFor='starRating'>
            Ratings
          </label>
          <StarRating
            className='dark:text-slate-50'
            maxRating={5}
            size={35}
            onSetRating={setStarRating}
            id='starRating'
            required
          />
        </div>

        <div className='flex flex-col w-[18rem] mx-auto my-auto p-1'>
          <label className='uppercase font-extrabold my-1' htmlFor='notes'>
            Did we have fun at {parkName} ?
          </label>
          <textarea
            className='bg-slate-200 border-[1px] border-slate-300 p-1 rounded-sm dark:text-slate-800 outline-accent-600'
            id='notes'
            onChange={(e) => setNotes(e.target.value)}
            value={notes}
            required
          />
        </div>

        <div className='flex flex-col w-[18rem] mx-auto my-auto p-1'>
          <label className='uppercase font-extrabold my-1' htmlFor='recreation'>
            Recreation Facilities in {parkName}
          </label>
          <textarea
            className='bg-slate-200 border-[1px] border-slate-300 p-1 rounded-sm dark:text-slate-800 outline-accent-600'
            id='recreation'
            onChange={(e) => setRecreation(e.target.value)}
            value={recreation}
            required
          />
        </div>

        <div className='flex flex-col w-[18rem] mx-auto my-auto p-1'>
          <label className='uppercase font-extrabold my-1' htmlFor='image'>
            Upload photos
          </label>
          <input
            className='bg-slate-200 border-[1px] border-slate-300 p-1 rounded-sm dark:text-slate-800 outline-accent-600'
            id='image'
            type='file'
            onChange={handleFileChange}
            disabled={isLoading}
          />
          {isLoading && <p>Uploading...</p>}
        </div>

        <div className='flex justify-between p-6 text-sm'>
          <Button className='text-slate-50' disabled={isLoading}>
            {isLoading ? 'Creating' : 'Add'}
          </Button>
          <BackButton />
        </div>
      </form>

      {/* UX feedback form */}
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

export default Form;
