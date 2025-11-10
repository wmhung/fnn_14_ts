'use server';

import { auth, signIn, signOut } from './auth';
import { revalidatePath } from 'next/cache';
import { supabase, supabaseUrl } from './supabase';
import { redirect } from 'next/navigation';
import { hash } from 'bcryptjs';
import { DEFAULT_LOGIN_REDIRECT } from '../api/auth/[...nextauth]/route';

import {
  CouldNotParseError,
  UserNotFoundError,
  InvalidPasswordError,
} from './errors';

import { AuthError } from 'next-auth';
import { readFile } from 'fs/promises';
import path from 'path';

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
export async function updatePassword(formData) {
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
  const hashedPassword = await hash(password, 12);

  const { error } = await supabase
    .from('user')
    .update([
      {
        password: hashedPassword,
      },
    ])
    .eq('email', session.user.email);

  if (error) {
    throw new Error('Profile could not be updated');
  }

  console.log('Update password successfully!');
  redirect('/login');
}

// update profile form
export async function updateUser(formData) {
  const session = await auth();
  if (!session) throw new Error('You must be logged in');

  const role = formData.get('role');
  const numOfKids = formData.get('numOfKids');
  const gender = formData.get('gender');
  const avatarFile = formData.get('avatar');

  const updateData = { role, numOfKids, gender };
  console.log(updateData);
  // Handle avatar upload if file exists
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

    if (storageError) {
      throw new Error('Avatar upload failed');
    }

    updateData.avatar = avatarPath;
  }

  const { error } = await supabase
    .from('user')
    .update(updateData)
    .eq('email', session.user.email);

  if (error) {
    throw new Error('Profile could not be updated');
  }

  revalidatePath('/dashboard/profile');
}

/////// credentials authentication

// Login
async function login(formData) {
  const email = formData.get('email');
  const password = formData.get('password');

  try {
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false, // must be false to catch errors
    });

    if (res?.error) {
      throw new Error(res.error); // fallback if not caught below
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

// const login = async (formData) => {
//   const email = formData.get('email');
//   const password = formData.get('password');

//   try {
//     await signIn('credentials', {
//       email,
//       password,
//       redirectTo: DEFAULT_LOGIN_REDIRECT,
//     });
//   } catch (error) {
//     if (error instanceof AuthError) {
//       switch (error.type) {
//         case 'CredentialsSignin':
//           return { error: 'Invalid credentials!' };
//         default:
//           return { error: 'Something went wrong!' };
//       }
//     }
//     throw error;
//   }
// };

// Register
const register = async (formData) => {
  // get value of 'name' in the formData
  const fullName = formData.get('fullName');
  const email = formData.get('email');
  const password = formData.get('password');
  const confirmPassword = formData.get('confirmPassword');
  const role = formData.get('role') || 'user'; // ✅ Get the role (default fallback)

  console.log(fullName);
  console.log(email);
  console.log(password);
  console.log(role); // ✅ Optional debug
  if (!fullName || !email || !password || !confirmPassword) {
    throw new Error('Please fill all fields');
  }

  if (password !== confirmPassword) {
    throw new Error('Passwords do not match');
  }

  const { data: existingUser } = await supabase
    .from('user')
    .select('id')
    .eq('email', email)
    .single();

  if (existingUser) {
    throw new Error('User already exists');
  }

  const hashedPassword = await hash(password, 12);
  // Read default avatar image from public folder
  const filePath = path.join(process.cwd(), 'public/default_avatar.png');
  const fileBuffer = await readFile(filePath);

  // Generate a unique filename (e.g., user email-based or uuid)
  const fileName = `${email.replace(/[@.]/g, '_')}_default.png`;

  // Upload the file to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('avatar') // Make sure the bucket is named 'avatars'
    .upload(fileName, fileBuffer, {
      contentType: 'image/png',
      upsert: true,
    });

  if (uploadError) {
    throw new Error('Failed to upload default avatar');
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('avatar').getPublicUrl(fileName);

  const { error } = await supabase.from('user').insert([
    {
      fullName,
      email,
      password: hashedPassword,
      avatar: publicUrl, // Save public URL of avatar
      role, // ✅ Insert role into the DB
    },
  ]);

  if (error) {
    throw new Error(error.message);
  }

  console.log('User created successfully!');
  redirect('/');
};

// Fetch All Users
const fetchAllUsers = async () => {
  const { data, error } = await supabase.from('users').select('*');
  if (error) {
    throw new Error('Failed to fetch users');
  }
  return data;
};

export { register, login, fetchAllUsers };
