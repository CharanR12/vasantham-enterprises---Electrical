import { useUser, useOrganization } from '@clerk/clerk-react';
import { User } from '../types';

export const useUserRole = () => {
    const { user } = useUser();
    const { membership } = useOrganization();

    const currentRole: 'admin' | 'user' = membership?.role === 'org:admin' ? 'admin' : 'user';
    const filterId = currentRole === 'admin' ? undefined : user?.id;

    const currentUser: User | null = user ? {
        id: user.id,
        name: user.fullName || '',
        mobile: user.primaryPhoneNumber?.phoneNumber || '',
        password: '',
        role: currentRole,
        createdAt: user.createdAt?.toISOString() || ''
    } : null;

    return {
        user: currentUser,
        membership,
        currentRole,
        filterId
    };
};
