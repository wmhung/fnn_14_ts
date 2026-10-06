'use client';

import { updateUser } from '../_lib/actions';
import {
  validateImage,
  ACCEPT_ATTR,
  MAX_AVATAR_BYTES,
  MAX_AVATAR_LABEL,
} from '../_lib/utils/storage-key';
import SubmitButton from './SubmitButton';
import { useFormState } from 'react-dom';
import { useRef, useState } from 'react';
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaLock,
  FaCamera,
  FaUser,
  FaChevronDown,
} from 'react-icons/fa';

type UpdateProfileFormProps = {
  user: {
    full_name: string;
    email: string;
    num_of_kids?: number | string;
    gender?: string;
    avatar?: string;
    role: 'user' | 'owner' | 'admin';
  };
  provider?: string | null;
};

// Shared input styling for editable fields
const inputClass =
  'w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 outline-none transition dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100';

const labelClass =
  'block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1.5';

const helperClass = 'text-xs text-gray-500 dark:text-slate-400 mt-1';

const sectionHeaderClass =
  'text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider';

export default function UpdateProfileForm({
  user,
  provider,
}: UpdateProfileFormProps) {
  const {
    full_name: fullName,
    email,
    role,
    avatar,
    num_of_kids: numOfKids,
    gender,
  } = user;

  // OAuth users' avatar comes from the provider and is read-only here.
  const isOAuth = provider === 'google' || provider === 'github';
  const providerLabel = provider === 'github' ? 'GitHub' : 'Google';

  const [state, formAction] = useFormState(updateUser, {
    success: false,
    error: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(
    avatar,
  );
  const [avatarError, setAvatarError] = useState('');

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      // Reject at pick time so the user isn't told after a failed submit.
      // updateUser revalidates server-side — this check is UX, not the guard.
      const invalid = validateImage(file, MAX_AVATAR_BYTES);
      if (invalid) {
        setAvatarError(invalid);
        e.target.value = '';
        return;
      }
      setAvatarError('');
      setAvatarPreview(URL.createObjectURL(file));
    }
  }

  return (
    <form
      action={formAction}
      className='w-full max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-gray-200 dark:ring-slate-700 p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8'
    >
      {/* SUCCESS BANNER */}
      {state?.success && (
        <div
          role='status'
          className='flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-200'
        >
          <FaCheckCircle className='shrink-0' />
          <span>個人資料已更新成功。</span>
        </div>
      )}

      {/* ERROR BANNER */}
      {state?.error && (
        <div
          role='alert'
          className='flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-200'
        >
          <FaExclamationCircle className='shrink-0' />
          <span>{state.error}</span>
        </div>
      )}

      {/* ACCOUNT INFO — read-only */}
      <section className='space-y-3'>
        <h2 className={sectionHeaderClass}>帳號資訊</h2>

        <div className='divide-y divide-gray-100 dark:divide-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 px-4'>
          <ReadOnlyRow label='使用者角色' value={role} />
          <ReadOnlyRow label='姓名' value={fullName} />
          <ReadOnlyRow label='電子郵件地址' value={email} />
        </div>
      </section>

      {/* ABOUT YOU — editable */}
      <section className='space-y-4'>
        <h2 className={sectionHeaderClass}>關於你</h2>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label htmlFor='num_of_kids' className={labelClass}>
              孩子人數
            </label>
            <SelectWithChevron
              id='num_of_kids'
              name='num_of_kids'
              defaultValue={numOfKids?.toString() ?? ''}
            >
              <option value=''>請選擇...</option>
              <option value='1'>1</option>
              <option value='2'>2</option>
              <option value='3'>3</option>
              <option value='over3'>超過 3 位</option>
            </SelectWithChevron>
            <p className={helperClass}>
              協助我們推薦適合親子的地點。
            </p>
          </div>

          <div>
            <label htmlFor='gender' className={labelClass}>
              性別
            </label>
            <SelectWithChevron
              id='gender'
              name='gender'
              defaultValue={gender ?? ''}
            >
              <option value=''>請選擇...</option>
              <option value='male'>男</option>
              <option value='female'>女</option>
            </SelectWithChevron>
            <p className={helperClass}>
              選填，僅用於個人化設定。
            </p>
          </div>
        </div>
      </section>

      {/* AVATAR */}
      <section className='space-y-4'>
        <h2 className={sectionHeaderClass}>大頭貼</h2>

        <div className='flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5'>
          {isOAuth ? (
            // OAuth users → read-only avatar from the provider, no upload
            <div className='shrink-0 self-center sm:self-auto h-20 w-20 sm:h-24 sm:w-24 rounded-full overflow-hidden ring-2 ring-gray-200 dark:ring-slate-700 flex items-center justify-center bg-gray-100 dark:bg-slate-800'>
              {avatarPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarPreview}
                  alt='個人照片'
                  referrerPolicy='no-referrer'
                  className='h-full w-full object-cover'
                />
              ) : (
                <FaUser className='w-10 h-10 text-gray-400' />
              )}
            </div>
          ) : (
            // Credentials users → tappable circle that opens the file picker
            <button
              type='button'
              onClick={() => fileInputRef.current?.click()}
              aria-label='更換大頭貼'
              className='group relative shrink-0 self-center sm:self-auto h-20 w-20 sm:h-24 sm:w-24 rounded-full overflow-hidden ring-2 ring-gray-200 dark:ring-slate-700 hover:ring-primary-500 focus:ring-primary-500 focus:outline-none transition flex items-center justify-center bg-gray-100 dark:bg-slate-800'
            >
              {avatarPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarPreview}
                  alt='大頭貼預覽'
                  className='h-full w-full object-cover'
                />
              ) : (
                <FaUser className='w-10 h-10 text-gray-400' />
              )}
              <span className='absolute inset-0 flex items-center justify-center gap-1 text-xs font-medium text-white bg-black/50 opacity-0 group-hover:opacity-100 transition'>
                <FaCamera />
                更換
              </span>
            </button>
          )}

          <div className='text-center sm:text-left'>
            <p className='text-sm font-medium text-gray-900 dark:text-slate-100'>
              個人照片
            </p>
            {isOAuth ? (
              <p className={helperClass}>
                你的照片由 {providerLabel} 帳號管理，無法在此變更。
              </p>
            ) : (
              <>
                <p className={helperClass}>
                  點選圓圈上傳照片。PNG 或 JPEG，最大{' '}
                  {MAX_AVATAR_LABEL}.
                </p>
                {avatarError && (
                  <p className='text-xs text-red-500 mt-1'>{avatarError}</p>
                )}
              </>
            )}
          </div>

          {/* Only credentials users submit a file field */}
          {!isOAuth && (
            <input
              ref={fileInputRef}
              id='avatar'
              type='file'
              name='avatar'
              accept={ACCEPT_ATTR}
              onChange={handleAvatarChange}
              className='sr-only'
            />
          )}
        </div>
      </section>

      {/* ACTION BAR */}
      <div className='flex justify-center sm:justify-end items-center pt-4 border-t border-gray-100 dark:border-slate-700'>
        <SubmitButton
          pendingLabel='更新中...'
          className='w-full sm:w-auto px-6 py-2.5 font-medium'
        >
          {state?.success ? '完成' : '儲存變更'}
        </SubmitButton>
      </div>
    </form>
  );
}

/* ---------- helpers ---------- */

function ReadOnlyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 py-3'>
      <div className='flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-slate-400'>
        <FaLock className='w-3 h-3' />
        <span>{label}</span>
      </div>
      <span className='text-sm font-medium text-gray-900 dark:text-slate-100 break-all sm:break-normal sm:truncate sm:max-w-[60%] sm:text-right'>
        {value}
      </span>
    </div>
  );
}

function SelectWithChevron({
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className='relative'>
      <select
        {...props}
        className={`${inputClass} appearance-none pr-9 cursor-pointer`}
      >
        {children}
      </select>
      <FaChevronDown className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400' />
    </div>
  );
}
