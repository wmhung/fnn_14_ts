'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useUrlPosition } from '@/app/_lib/hooks/useUrlPosition';
import { usePlaces } from '../_lib/contexts/PlaceContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { getUserPlaceCount, createFeedback } from '@/app/_lib/data-service';
import {
  validateImage,
  ACCEPT_ATTR,
  MAX_PLACE_IMAGE_BYTES,
  MAX_PLACE_IMAGE_LABEL,
} from '@/app/_lib/utils/storage-key';

// [CHANGED] import canonical types from the single source of truth
import type { Place, PlaceInput } from '@/types/place';

import DatePicker from 'react-datepicker';
import Button from './Button';
import BackButton from './BackButton';
import Message from './Message';
import Spinner from './Spinner';
import StarRating from './StarRating';
import FeedbackModal from './FeedbackModal';
import 'react-datepicker/dist/react-datepicker.css';

// [REMOVED] local PlaceInput redeclaration — now imported above

export interface FormUser {
  id?: string;
  email: string;
  full_name?: string;
}

type FormMode = 'create' | 'edit';

interface FormProps {
  user: FormUser;
  user_name?: string;
  mode?: FormMode;
  initialPlace?: Place;
}

interface FeedbackData {
  app_rating: number;
  review: string;
}

const BASE_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

export default function Form({
  user,
  user_name,
  mode = 'create',
  initialPlace,
}: FormProps) {
  const isEdit = mode === 'edit';

  const [urlLat, urlLng] = useUrlPosition();
  const lat = isEdit ? (initialPlace?.position?.lat ?? null) : urlLat;
  const lng = isEdit ? (initialPlace?.position?.lng ?? null) : urlLng;

  // Optional place name handed in by a discovered POI
  // (Overpass "Add this place" → /placelist/form?...&name=). Create mode only.
  const searchParams = useSearchParams();
  const urlName = searchParams.get('name');

  //  `error` was never destructured, so upload failures dispatched by
  // PlaceContext.uploadImage never reached the screen — the form just went
  // quiet. That's what made the 400 InvalidKey bug so hard to see.
  const {
    createPlace,
    updatePlace,
    isLoading,
    error: placeError,
  } = usePlaces();
  const router = useRouter();
  const { email, full_name } = user;

  const displayName = full_name || user_name || 'Anonymous';

  const [isLoadingGeocoding, setIsLoadingGeocoding] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [success, setSuccess] = useState(false);

  const [dist, setDist] = useState(initialPlace?.dist ?? '');
  const [placeName, setPlaceName] = useState(
    initialPlace?.place_name ?? (isEdit ? '' : (urlName ?? '')),
  );
  const [city, setCity] = useState(initialPlace?.city ?? '');
  const [date, setDate] = useState<Date>(
    initialPlace?.date ? new Date(initialPlace.date) : new Date(),
  );
  const [notes, setNotes] = useState(initialPlace?.notes ?? '');
  const [recreation, setRecreation] = useState(initialPlace?.recreation ?? '');
  const [image, setImage] = useState<File | null>(null);
  const [starRating, setStarRating] = useState(initialPlace?.star_rating ?? 0);
  const [geocodingError, setGeocodingError] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [imageError, setImageError] = useState('');

  useEffect(() => {
    if (isEdit) return;
    if (urlName) setPlaceName(urlName);
  }, [urlName, isEdit]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // Reject at pick time, not submit time — the user finds out immediately
      // and still has the picker fresh in mind.
      const invalid = validateImage(file, MAX_PLACE_IMAGE_BYTES);
      if (invalid) {
        setImageError(invalid);
        setImage(null);
        e.target.value = ''; // allow re-picking the same file after fixing it
        return;
      }
      setImageError('');
      setImage(file);
    }
  };

  useEffect(() => {
    if (isEdit) return;
    if (!urlLat || !urlLng) return;

    async function fetchCityData() {
      try {
        setIsLoadingGeocoding(true);
        const res = await fetch(
          `${BASE_URL}?latitude=${urlLat}&longitude=${urlLng}`,
        );
        const data = await res.json();
        if (!data.countryCode) {
          throw new Error(
            '這裡似乎不是城市，請點選其他位置。',
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
  }, [urlLat, urlLng, isEdit]);

  async function handleFeedbackSubmit({
    app_rating: appRating,
    review,
  }: FeedbackData) {
    try {
      // Fail loud if email is somehow missing, instead of writing an
      // orphaned feedback row. (email is the FK -> user(email).)
      if (!user.email) {
        throw new Error('Cannot submit feedback: missing user email');
      }
      await createFeedback({
        email: user.email,
        app_rating: appRating,
        review,
      });
    } catch (err: any) {
      console.error('Failed to submit feedback:', err.message);
    } finally {
      setShowFeedbackModal(false);
      router.push('/placelist');
      router.refresh();
    }
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!placeName || !date || (!isEdit && !image)) {
      setErrorMsg('請填寫所有必填欄位');
      return;
    }
    setErrorMsg('');

    if (isEdit && initialPlace) {
      try {
        await updatePlace({
          id: initialPlace.id,
          dist,
          city,
          place_name: placeName,
          date: date.toISOString(),
          notes,
          recreation,
          star_rating: starRating,
          email,
          ...(image ? { image } : {}),
        });
        setSuccess(true);
        setTimeout(() => {
          router.push('/placelist');
          router.refresh();
        }, 1000);
      } catch (err: any) {
        console.error('Update place failed:', err.message);
        setErrorMsg('更新地點失敗，請再試一次。');
      }
      return;
    }

    // Default null (not 0) so a failed/unknown count does NOT get treated as a
    // first add — only a real count of 0 triggers the feedback modal. [FIX]
    let countBefore: number | null = null;
    try {
      countBefore = await getUserPlaceCount(email);
    } catch (error: any) {
      console.error('Error in getUserPlaceCount:', error.message);
    }

    const newPlace: PlaceInput = {
      dist,
      city,
      place_name: placeName,
      date: date.toISOString(),
      notes,
      recreation,
      position: { lat, lng },
      image: image as File,
      star_rating: starRating,
      email,
    };

    try {
      await createPlace(newPlace);
    } catch (err: any) {
      console.error('Create place failed:', err.message);
      setErrorMsg('新增地點失敗，請再試一次。');
      return;
    }

    if (countBefore === 0) {
      // First-ever add → pop the feedback modal. Keep `success` false so the
      // main return renders and the modal overlay can mount; the modal's
      // onClose / onSubmit handle the redirect to /placelist. [FIX]
      setShowFeedbackModal(true);
    } else {
      // Subsequent adds → show success, then redirect. [FIX]
      setSuccess(true);
      setTimeout(() => {
        router.push('/placelist');
        router.refresh();
      }, 1200);
    }
  }

  if (isLoadingGeocoding) return <Spinner />;
  if (!isEdit && !lat && !lng)
    return <Message message='請先在地圖上點選一個位置' />;
  if (geocodingError) return <Message message={geocodingError} />;

  if (success) {
    return (
      <Message
        message={
          isEdit
            ? '✅ 地點更新成功！'
            : '✅ 地點新增成功！'
        }
      />
    );
  }

  return (
    <>
      <form
        className='flex flex-col w-[30rem] h-[83vh] mx-3 px-2 py-3 overflow-y-scroll overflow-x-hidden gap-[2px] list-none border rounded-lg inset-shadow dark:bg-slate-800 dark:border-slate-700'
        onSubmit={submit}
      >
        <h1 className='text-center text-xl font-bold uppercase my-2'>
          {isEdit ? '編輯地點' : '新增地點'}
        </h1>

        {(errorMsg || placeError) && (
          <p className='text-red-500 text-center font-semibold'>
            {errorMsg || placeError}
          </p>
        )}

        <div className='flex flex-col w-[18rem] mx-auto my-auto p-1'>
          <label className='uppercase font-extrabold m-1'>城市</label>
          <input
            className='bg-slate-200 border p-1 rounded-sm dark:text-slate-800'
            onChange={(e) => setCity(e.target.value)}
            value={city}
          />
        </div>

        <div className='flex flex-col w-[18rem] mx-auto my-auto p-1'>
          <label className='uppercase font-extrabold m-1'>行政區</label>
          <input
            className='bg-slate-200 border p-1 rounded-sm dark:text-slate-800'
            onChange={(e) => setDist(e.target.value)}
            value={dist}
          />
        </div>

        <div className='flex flex-col w-[18rem] mx-auto my-auto p-1'>
          <label className='uppercase font-extrabold my-1'>地點名稱</label>
          <input
            className='bg-slate-200 border p-1 rounded-sm dark:text-slate-800'
            onChange={(e) => setPlaceName(e.target.value)}
            value={placeName}
            required
          />
        </div>

        <div className='flex flex-col w-[18rem] mx-auto my-auto p-1'>
          <label className='uppercase font-extrabold my-1'>日期</label>
          <DatePicker
            className='bg-slate-200 border p-1 rounded-sm dark:text-slate-800'
            onChange={(d: Date | null) => setDate(d ?? new Date())}
            selected={date}
            dateFormat='dd/MM/yyyy'
          />
        </div>

        <div className='flex flex-col w-[18rem] mx-auto my-auto p-1'>
          <label className='uppercase font-extrabold my-1'>評分</label>
          <StarRating
            maxRating={5}
            size={35}
            defaultRating={starRating}
            onSetRating={setStarRating}
          />
        </div>

        <div className='flex flex-col w-[18rem] mx-auto my-auto p-1'>
          <label className='uppercase font-extrabold my-1'>筆記</label>
          <textarea
            className='bg-slate-200 border p-1 rounded-sm dark:text-slate-800'
            onChange={(e) => setNotes(e.target.value)}
            value={notes}
            required
          />
        </div>

        <div className='flex flex-col w-[18rem] mx-auto my-auto p-1'>
          <label className='uppercase font-extrabold my-1'>休閒設施</label>
          <textarea
            className='bg-slate-200 border p-1 rounded-sm dark:text-slate-800'
            onChange={(e) => setRecreation(e.target.value)}
            value={recreation}
            required
          />
        </div>

        <div className='flex flex-col w-[18rem] mx-auto my-auto p-1'>
          <label className='uppercase font-extrabold my-1'>
            {isEdit ? '更換照片（選填）' : '上傳照片'}
          </label>
          {isEdit && initialPlace?.image && (
            <p className='text-xs text-slate-500 mb-1'>
              除非選擇新照片，否則將保留目前的照片。
            </p>
          )}
          <input
            type='file'
            accept={ACCEPT_ATTR}
            onChange={handleFileChange}
            disabled={isLoading}
          />
          <p className='text-xs text-slate-500 mt-1'>
            PNG 或 JPEG，最大 {MAX_PLACE_IMAGE_LABEL}。
          </p>
          {imageError && (
            <p className='text-xs text-red-500 font-semibold mt-1'>
              {imageError}
            </p>
          )}
          {isLoading && <p>{isEdit ? '更新中...' : '上傳中...'}</p>}
        </div>

        <div className='flex justify-between p-6 text-sm text-slate-200'>
          <Button disabled={isLoading}>
            {isLoading
              ? isEdit
                ? '儲存中...'
                : '建立中...'
              : isEdit
                ? '儲存'
                : '新增'}
          </Button>
          <BackButton />
        </div>
      </form>

      {showFeedbackModal && (
        <FeedbackModal
          onClose={() => {
            setShowFeedbackModal(false);
            router.push('/placelist');
            router.refresh();
          }}
          onSubmit={handleFeedbackSubmit}
        />
      )}
    </>
  );
}
