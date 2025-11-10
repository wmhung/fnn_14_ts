'use server';

import { auth, signIn, signOut } from './auth';
import { revalidatePath } from 'next/cache';
import { supabase, supabaseUrl } from './supabase';
import { redirect } from 'next/navigation';
import { hash } from 'bcryptjs';
import path from 'path';
import { readFile } from 'fs/promises';

import {
  CouldNotParseError,
  UserNotFoundError,
  InvalidPasswordError,
} from './errors';

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

  const password = formData.get('password');
  const confirmPassword = formData.get('confirmPassword');

  if (!password || !confirmPassword) {
    throw new Error('Please fill all fields');
  }

  if (password !== confirmPassword) {
    throw new Error('Passwords do not match');
  }

  const hashedPassword = await hash(password as string, 12);

  const { error } = await supabase
    .from('user')
    .update([{ password: hashedPassword }])
    .eq('email', session.user.email);

  if (error) throw new Error('Profile could not be updated');

  console.log('Update password successfully!');
  redirect('/login');
}

// update user profile
export async function updateUser(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error('You must be logged in');

  const role = formData.get('role');
  const numOfKids = formData.get('numOfKids');
  const gender = formData.get('gender');
  const avatarFile = formData.get('avatar') as File | null;

  const updateData: Record<string, any> = { role, numOfKids, gender };

  if (avatarFile && avatarFile.size > 0) {
    const avatarName = `${Math.floor(Math.random() * 1000 + 1)}-${
      avatarFile.name
    }`.replaceAll('/', '');
    const avatarPath = `${supabaseUrl}/storage/v1/object/public/avatar/${avatarName}`;

    const { error: storageError } = await supabase.storage
      .from('avatar')
      .upload(avatarName, avatarFile, {
        cacheControl: '3600',
        upsert: true,
      });

    if (storageError) throw new Error('Avatar upload failed');

    updateData.avatar = avatarPath;
  }

  const { error } = await supabase
    .from('user')
    .update(updateData)
    .eq('email', session.user.email);

  if (error) throw new Error('Profile could not be updated');

  revalidatePath('/dashboard/profile');
}

/////// credentials authentication ///////

// Login
export async function login(
  formData: FormData
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

// ✅ Register
export async function register(
  formData: FormData
): Promise<{ error?: string }> {
  try {
    const fullName = formData.get('fullName');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    const role = formData.get('role') || 'user';

    if (!fullName || !email || !password || !confirmPassword) {
      return { error: 'Please fill all fields' };
    }

    if (password !== confirmPassword) {
      return { error: 'Passwords do not match' };
    }

    const { data: existingUser } = await supabase
      .from('user')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return { error: 'User already exists' };
    }

    const hashedPassword = await hash(password as string, 12);

    // read default avatar
    const filePath = path.join(process.cwd(), 'public/default_avatar.png');
    const fileBuffer = await readFile(filePath);
    const fileName = `${(email as string).replace(/[@.]/g, '_')}_default.png`;

    const { error: uploadError } = await supabase.storage
      .from('avatar')
      .upload(fileName, fileBuffer, {
        contentType: 'image/png',
        upsert: true,
      });

    if (uploadError) {
      return { error: 'Failed to upload default avatar' };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('avatar').getPublicUrl(fileName);

    const { error } = await supabase.from('user').insert([
      {
        fullName,
        email,
        password: hashedPassword,
        avatar: publicUrl,
        role,
      },
    ]);

    if (error) {
      return { error: error.message };
    }

    console.log('User created successfully!');
    // redirect('/'); // will not return
    return {}; // let client handle redirect
  } catch (err: any) {
    return { error: err.message || 'Something went wrong' };
  }
}

// Fetch All Users
export async function fetchAllUsers() {
  const { data, error } = await supabase.from('users').select('*');
  if (error) throw new Error('Failed to fetch users');
  return data;
}
