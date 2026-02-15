import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUserRole } from '../hooks/useUserRole';

export type Branch = 'Kaikativalasu' | 'Solar';

interface BranchContextType {
    currentBranch: Branch;
    setBranch: (branch: Branch) => void;
    availableBranches: Branch[];
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export const BranchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentRole, isLoaded } = useUserRole();
    const [currentBranch, setCurrentBranch] = useState<Branch>('Kaikativalasu');

    useEffect(() => {
        if (isLoaded) {
            if (currentRole === 'solar_user') {
                setCurrentBranch('Solar');
            } else if (currentRole === 'user') {
                setCurrentBranch('Kaikativalasu');
            }
            // Admins keep their selected branch
        }
    }, [currentRole, isLoaded]);

    const setBranch = (branch: Branch) => {
        if (currentRole === 'admin') {
            setCurrentBranch(branch);
        }
    };

    const availableBranches: Branch[] = ['Kaikativalasu', 'Solar'];

    return (
        <BranchContext.Provider value={{ currentBranch, setBranch, availableBranches }}>
            {children}
        </BranchContext.Provider>
    );
};

export const useBranch = () => {
    const context = useContext(BranchContext);
    if (context === undefined) {
        throw new Error('useBranch must be used within a BranchProvider');
    }
    return context;
};
