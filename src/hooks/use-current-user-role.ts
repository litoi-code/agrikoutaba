
'use client';
import type { Worker } from '@/lib/types';

/**
 * Mocked hook to provide full Admin access to all users.
 * Authentication and specific worker lookups are removed.
 */
export function useCurrentUserRole() {
  const currentWorker: Worker = {
    id: 'admin-user',
    firstName: 'Agri',
    lastName: 'Admin',
    email: 'admin@agrikoutaba.com',
    role: 'Admin',
    contactNumber: 'N/A',
    taskIds: [],
  };

  return { 
    role: 'Admin' as const, 
    isLoading: false, 
    currentWorker 
  };
}
