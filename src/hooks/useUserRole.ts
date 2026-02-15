import { useUser, useOrganization } from '@clerk/clerk-react';
import { User } from '../types';

export type UserRole = 'admin' | 'user' | 'solar_user';

export const useUserRole = () => {
    const { user } = useUser();
    const { membership } = useOrganization();

    let currentRole: UserRole = 'user';
    if (membership?.role === 'org:admin') {
        currentRole = 'admin';
    } else if (membership?.role === 'org:member_solar') {
        currentRole = 'solar_user';
    }

    const filterId = currentRole === 'admin' ? undefined : user?.id;

    const currentUser: User | null = user ? {
        id: user.id,
        name: user.fullName || '',
        mobile: user.primaryPhoneNumber?.phoneNumber || '',
        password: '',
        role: currentRole === 'solar_user' ? 'user' : currentRole, // Map back to 'user' for type compatibility if needed elsewhere, or extend User type
        createdAt: user.createdAt?.toISOString() || ''
    } : null;

    return {
        user: currentUser,
        membership,
        currentRole,
        filterId,
        isLoaded: useUser().isLoaded && useOrganization().isLoaded
    };
};
