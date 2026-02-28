import React, { createContext, useState, type ReactNode } from 'react';

interface AdminSearchContextType {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
}

export const AdminSearchContext = createContext<AdminSearchContextType>({
    searchTerm: '',
    setSearchTerm: () => { },
});

export const AdminSearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <AdminSearchContext.Provider value={{ searchTerm, setSearchTerm }}>
            {children}
        </AdminSearchContext.Provider>
    );
};
