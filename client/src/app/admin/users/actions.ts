'use server';

import { revalidatePath } from 'next/cache';
import { apiFetch } from '@/lib/api';

async function patchUser(formData: FormData, action: 'suspend' | 'activate') {
  const id = formData.get('id');
  if (typeof id !== 'string') throw new Error('User ID is required');

  await apiFetch(`/api/admin/users/${id}/${action}`, { method: 'PATCH' });
  revalidatePath('/admin/users');
}

export async function suspendUser(formData: FormData) {
  await patchUser(formData, 'suspend');
}

export async function activateUser(formData: FormData) {
  await patchUser(formData, 'activate');
}
