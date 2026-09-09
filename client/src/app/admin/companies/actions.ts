'use server';

import { revalidatePath } from 'next/cache';
import { apiFetch } from '@/lib/api';

async function patchCompany(formData: FormData, action: 'verify' | 'suspend') {
  const id = formData.get('id');
  if (typeof id !== 'string') throw new Error('Company ID is required');

  await apiFetch(`/api/admin/companies/${id}/${action}`, { method: 'PATCH' });
  revalidatePath('/admin/companies');
}

export async function verifyCompany(formData: FormData) {
  await patchCompany(formData, 'verify');
}

export async function suspendCompany(formData: FormData) {
  await patchCompany(formData, 'suspend');
}
