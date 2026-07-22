'use server';

import { auth, signIn, signOut } from './auth';
import { revalidatePath } from 'next/cache';
import { supabase, supabaseUrl } from './supabase';
import { supabaseAdmin } from './supabase-admin';
import { redirect } from 'next/navigation';
import { hash } from 'bcryptjs';
import path from 'path';
import { readFile } from 'fs/promises';

import {
  CouldNotParseError,
  UserNotFoundError,
  InvalidPasswordError,
} from './errors';

import crypto from 'crypto';
import { sendResetEmail } from './email';
import {
  registerSchema,
  updatePasswordSchema,
  resetPasswordSchema,
  updateUserSchema,
} from './userSchema';
import {
  buildStorageKey,
  validateImage,
  MAX_AVATAR_BYTES,
} from './utils/storage-key';

// google authentication
export async function signInAction() {
  await signIn('google', { redirectTo: '/dashboard' });
}

export async function signInAction2() {
  await signIn('github', { redirectTo: '/dashboard' });
}

export async function signOutAction() {
  await signOut({ redirectTo: '/' });
}

// update password data
export async function updatePassword(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error('You must be logged in');

  const parsed = updatePasswordSchema.safeParse({
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const { password } = parsed.data;

  const hashedPassword = await hash(password, 12);

  const { error } = await supabase
    .from('user')
    .update([{ password: hashedPassword }])
    .eq('email', session.user.email);

  if (error) throw new Error('Profile could not be updated');

  console.log('Update password successfully!');
  redirect('/login');
}

export async function updateUser(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) {
    return { error: 'You must be logged in' }; // [FIX] return, not throw
  }

  // OAuth users' avatar is owned by the provider (Google/GitHub) and is
  // read-only in this app — never let an avatar change through for them.
  const isOAuth =
    session.user.provider === 'google' || session.user.provider === 'github';

  // ────────── Whitelist + validate ──────────

  // Single source of truth: updateUserSchema (mirrors the form's select options).
  const parsed = updateUserSchema.safeParse({
    num_of_kids: formData.get('num_of_kids'),
    gender: formData.get('gender'),
  });
  if (!parsed.success) {
    return { error: 'Invalid profile value' };
  }
  const numOfKids = parsed.data.num_of_kids ?? '';
  const gender = parsed.data.gender ?? '';
  const avatarFile = formData.get('avatar') as File | null;

  // Build the update payload EXPLICITLY — no spread, no ambient fields. [FIX]
  const updateData: Record<string, any> = {
    num_of_kids: numOfKids || null,
    gender: gender || null,
  };

  if (!isOAuth && avatarFile && avatarFile.size > 0) {
    // Server-side revalidation: the client checks too, but a Server Action is
    // a public endpoint — the browser's check is UX, this one is the guard.
    const invalid = validateImage(avatarFile, MAX_AVATAR_BYTES);
    if (invalid) return { error: invalid };

    // Key is generated, never derived from avatarFile.name — a non-ASCII
    // filename fails Supabase's key regex with 400 InvalidKey. The UUID also
    // removes the collision risk the old Math.random() prefix carried.
    const avatarName = buildStorageKey(avatarFile.type)!;
    const avatarPath = `${supabaseUrl}/storage/v1/object/public/avatar/${avatarName}`;
    const { error: storageError } = await supabase.storage
      .from('avatar')
      .upload(avatarName, avatarFile, { cacheControl: '3600', upsert: true });
    if (storageError) return { error: 'Avatar upload failed' };
    updateData.avatar = avatarPath;
  }

  const { error } = await supabase
    .from('user')
    .update(updateData)
    .eq('email', session.user.email);

  if (error) {
    console.error(error);
    return { error: error.message };
  }

  revalidatePath('/dashboard/profile');
  return { success: true };
}

/////// credentials authentication ///////

// Login
export async function login(
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const email = formData.get('email');
  const password = formData.get('password');

  try {
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      return { error: res.error };
    }

    return { success: true };
  } catch (error) {
    if (error instanceof CouldNotParseError) {
      return { error: 'Invalid input format.' };
    }
    if (error instanceof UserNotFoundError) {
      return { error: 'This email is not registered.' };
    }
    if (error instanceof InvalidPasswordError) {
      return { error: 'Incorrect password.' };
    }
    return { error: 'Something went wrong. Please try again.' };
  }
}

//  Register
export async function register(
  formData: FormData,
): Promise<{ error?: string }> {
  try {
    console.log('[register] START', formData.get('email'));

    const parsed = registerSchema.safeParse({
      full_name: formData.get('full_name'),
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
    }

    // typed strings from here on — schema also enforces email format,
    // password length >= 8, and password === confirmPassword
    const { full_name: fullName, email, password } = parsed.data;

    const { data: existingUser } = await supabase
      .from('user')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return { error: 'User already exists' };
    }

    const hashedPassword = await hash(password, 12);

    // read default avatar
    const filePath = path.join(process.cwd(), 'public/default_avatar.png');
    const fileBuffer = await readFile(filePath);
    const fileName = `${email.replace(/[@.]/g, '_')}_default.png`;

    console.log('[register] BEFORE upload', fileName);

    const { error: uploadError } = await supabaseAdmin.storage
      .from('avatar')
      .upload(fileName, fileBuffer, {
        contentType: 'image/png',
        upsert: true,
      });
    console.log('[register] AFTER upload', uploadError);

    if (uploadError) {
      return { error: 'Failed to upload default avatar' };
    }

    // Build the URL explicitly — guarantees /public/ regardless of SDK version
    // and matches the pattern used by updateUser and the place-upload flow.    [FIX]
    const avatarPath = `${supabaseUrl}/storage/v1/object/public/avatar/${fileName}`;

    const { error } = await supabaseAdmin.from('user').insert([
      {
        full_name: fullName,
        email,
        password: hashedPassword,
        avatar: avatarPath,
      },
    ]);

    if (error) {
      return { error: error.message };
    }

    console.log('User created successfully!');
    return {}; // let client handle redirect
  } catch (err: any) {
    return { error: err.message || 'Something went wrong' };
  }
}

// Fetch All Users
export async function fetchAllUsers() {
  const { data, error } = await supabase.from('user').select('*');
  if (error) throw new Error('Failed to fetch users');
  return data;
}

// ── 1. Request a reset link ────────────────────────────────────────
export async function requestPasswordReset(
  formData: FormData,
): Promise<{ ok: boolean }> {
  const email = String(formData.get('email') ?? '')
    .toLowerCase()
    .trim();
  if (!email) return { ok: true }; // never leak

  const { data: user } = await supabaseAdmin
    .from('user')
    .select('id, email')
    .eq('email', email)
    .single();

  // Only act when the user exists, but ALWAYS return ok
  // so attackers can't enumerate which emails are registered.
  if (user) {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    const { error: insertErr } = await supabaseAdmin
      .from('password_reset_token')
      .insert({
        user_id: user.id,
        token_hash: tokenHash,
        expires_at: new Date(Date.now() + 30 * 60_000).toISOString(),
      });

    if (insertErr) {
      console.error('[reset] insert failed:', insertErr);
      return { ok: true }; // generic response, but error is logged server-side
    }

    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?token=${rawToken}`;
    await sendResetEmail(user.email, resetUrl);
  }

  return { ok: true };
}

// ── 1b. Validate a reset token WITHOUT consuming it (for page load) ─
// Read-only: used by the reset-password page to decide whether to render
// the form or the expired-state card. The real security gate is still
// resetPassword() below, which re-checks on submit.
export async function isResetTokenValid(rawToken: string): Promise<boolean> {
  if (!rawToken) return false;

  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  const { data: row } = await supabaseAdmin
    .from('password_reset_token')
    .select('used_at')
    .eq('token_hash', tokenHash)
    .gt('expires_at', new Date().toISOString()) // DB compares in UTC
    .is('used_at', null)
    .single();

  return !!row;
}

// ── 2. Consume the token and set a new password ────────────────────
export async function resetPassword(
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get('token') ?? '',
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { token: rawToken, password } = parsed.data;

  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  const { data: row } = await supabaseAdmin // was supabase
    .from('password_reset_token')
    .select('id, user_id, expires_at, used_at')
    .eq('token_hash', tokenHash)
    .single();

  if (!row || row.used_at || new Date(row.expires_at) < new Date()) {
    return { error: 'This link is invalid or has expired.' };
  }

  const hashedPassword = await hash(password, 12);

  const { error: updateErr } = await supabaseAdmin // was supabase
    .from('user')
    .update({ password: hashedPassword })
    .eq('id', row.user_id);

  if (updateErr) return { error: 'Could not update password.' };

  await supabaseAdmin // was supabase
    .from('password_reset_token')
    .update({ used_at: new Date().toISOString() })
    .eq('id', row.id);

  return { success: true };
}
