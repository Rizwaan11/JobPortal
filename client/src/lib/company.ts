import "server-only";

import { cache } from "react";

import { ApiError, apiFetch } from "@/lib/api";
import type { CompanyRole } from "@/types/company-members";

export type CompanyContext = {
  _id: string;
  name: string;
  slug: string;
  website?: string;
  verified: boolean;
  suspended: boolean;
  createdAt: string;
  companyRole: CompanyRole;
};

export const getCompanyContext = cache(async (): Promise<CompanyContext> => {
  return (await apiFetch("/api/companies/me")) as CompanyContext;
});

export async function getOptionalCompanyContext(): Promise<CompanyContext | null> {
  try {
    return await getCompanyContext();
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function getPublicCompanyContext(): Promise<CompanyContext | null> {
  try {
    return await getCompanyContext();
  } catch (error) {
    if (error instanceof ApiError) return null;
    throw error;
  }
}
