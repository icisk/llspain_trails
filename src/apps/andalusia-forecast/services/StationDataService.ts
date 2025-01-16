import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Typdefinition für den Context
type DatacontextType = {
    data: any | null; // Daten (z. B. Wetterstationen)
    loading: boolean; // Ladezustand
    error: string | null; // Fehlermeldung, falls vorhanden
};

// React Context mit Typ
const Datacontext = createContext<DatacontextType | undefined>(undefined);

interface DataProviderProps {
    children: ReactNode;
}

// Provider-Komponente
export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
    const [data, setData] = useState<any | null>(null); // Zustand für Daten
    const [loading, setLoading] = useState<boolean>(true); // Zustand für Laden
    const [error, setError] = useState<string | null>(null); // Zustand für Fehler

    // Daten beim Mount laden
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("https://i-cisk.dev.52north.org/data/collections/ll_spain_creaf_in_boundary/items?f=json&limit=1000");
                if (!response.ok) throw new Error("Failed to fetch data");
                const result = await response.json();
                setData(result); // Daten speichern
            } catch (err: any) {
                setError(err.message); // Fehler speichern
            } finally {
                setLoading(false); // Ladezustand beenden
            }
        };

        fetchData();
    }, []);

    // Provider für den Context
    return (
        <Datacontext.Provider value={{ data, loading, error }}>
            {children}
        </Datacontext.Provider>
    );
};

// Hook für den Zugriff auf den Context
export const useData = (): DatacontextType => {
    const context = useContext(Datacontext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
