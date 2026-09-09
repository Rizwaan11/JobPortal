'use server';

import { revalidatePath } from 'next/cache';
import { apiFetch } from '@/lib/api';

export async function closeJob(formData: FormData) {
  const id = formData.get('id');
  if (typeof id !== 'string') throw new Error('Job ID is required');

  await apiFetch(`/api/admin/jobs/${id}/close`, { method: 'PATCH' });
  revalidatePath('/admin/jobs');
}
